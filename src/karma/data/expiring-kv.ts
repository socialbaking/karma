import { KeyValueStore } from "./types";
import { getKeyValueStore, KeyValueStoreOptions } from "./kv";
import {
  connectGlobalRedisClient,
  getRedisPrefixedKey,
  isRedis,
} from "./redis-client";
import { Expiring } from "./expiring";

// Added to only where redis is not in use
// Allows just for IDE based debugging
export const EXPIRING_KEYS = new Set<`${string}|${string}`>();

export const MINUTE_MS = 60 * 1000;
export const DAY_MS = 24 * 60 * MINUTE_MS;
export const MONTH_MS = 31 * DAY_MS;
export const DEFAULT_EXPIRES_IN_MS = 7 * DAY_MS;

export function getExpiresAt(
  ms = DEFAULT_EXPIRES_IN_MS,
  defaultExpiresAt?: string
): string {
  return defaultExpiresAt ?? new Date(Date.now() + ms).toISOString();
}

export function getExpiresInMilliseconds(expiresAt: string) {
  const expiresAtMs = new Date(expiresAt).getTime();
  // now should be smaller than when it expires
  // so we should minus the current time from it, then that's our ms left
  return expiresAtMs - Date.now();
}

export function getExpiringStore<T extends Expiring>(
  name: string,
  options?: KeyValueStoreOptions
): KeyValueStore<T> {
  const store = getKeyValueStore<T>(name, options);

  function getKey(key: string): string {
    return getRedisPrefixedKey(name, key);
  }

  return {
    ...store,
    async set(key, value) {
      const { expiresAt } = value;

      await store.set(key, value);

      if (!expiresAt) {
        // Not yet expiring
        return;
      }

      const expiresInMs = getExpiresInMilliseconds(expiresAt);

      if (isExpired(expiresInMs)) {
        // Already expired
        console.warn(`Deleting already expired key ${key}`);
        return await store.delete(key);
      }

      /* c8 ignore start */
      if (!isRedis()) {
        EXPIRING_KEYS.add(`${name}|${key}`);
        return;
      }
      /* c8 ignore stop */
      const expiresInSeconds = Math.ceil(expiresInMs / 1000);
      const redisKey = getKey(key);
      const client = await connectGlobalRedisClient();
      await client.expire(redisKey, expiresInSeconds);
    },
    async get(key) {
      const value = await store.get(key);
      if (!value) return value;
      if (isRedis()) return value; // trust redis expiry
      const { expiresAt } = value;
      if (!expiresAt) return value;
      if (isExpired(getExpiresInMilliseconds(expiresAt))) {
        return undefined;
      }
      return value;
    },
  };

  function isExpired(expiresInMs: number) {
    return expiresInMs <= 0;
  }
}
