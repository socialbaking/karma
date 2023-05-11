import {KeyValueStore} from "./types";
import {getKeyValueStore} from "./kv";
import {connectGlobalRedisClient, getRedisPrefixedKey, isRedis} from "./redis-client";
import {Expiring} from "./expiring";

// Added to only where redis is not in use
// Allows just for IDE based debugging
export const EXPIRING_KEYS = new Set<`${string}|${string}`>();

export function getExpiringStore<T extends Expiring>(name: string): KeyValueStore<T> {
    const store = getKeyValueStore<T>(name);

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

            const expiresAtMs = new Date(expiresAt).getTime();
            // now should be smaller than when it expires
            // so we should minus the current time from it, then thats our ms left
            const expiresInMs = expiresAtMs - Date.now();

            if (expiresInMs <= 0) {
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

            const expiresInSeconds = Math.ceil(expiresAtMs / 1000);
            const redisKey = getKey(key);
            const client = await connectGlobalRedisClient();
            await client.expire(redisKey, expiresInSeconds);
        }
    }
}