import { Cached } from "./types";
import { DAY_MS, getExpiringStore } from "../expiring-kv";

export const DEFAULT_EXPIRES_IN_MS = 0.25 * DAY_MS;
export const PAGE_EXPIRES_IN_MS = 0.25 * DAY_MS;

const STORE_NAME = "cache" as const;

export function getCacheStore<T>() {
  return getExpiringStore<Cached<T>>(STORE_NAME, {
    counter: false,
  });
}
