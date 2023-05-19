import { getAuthenticationRoles } from "../../authentication";
import { createHash } from "crypto";
import {
  DEFAULT_EXPIRES_IN_MS,
  getCacheStore,
  PAGE_EXPIRES_IN_MS,
} from "./store";
import { getGlobalCount } from "../kv";
import { Cached, CacheData } from "./types";
import { getOrigin } from "../../listen/config";
import { getExpiresAt } from "../expiring-kv";
import { commit, packageIdentifier } from "../../package";

function getSortedRoles() {
  return getAuthenticationRoles()
    .slice()
    .sort((a, b) => (a < b ? -1 : 1));
}

function getCacheKey(givenKey: string, roles = getSortedRoles()) {
  const hash = createHash("sha512");
  roles.forEach((role, index) => {
    hash.update(`role: ${role} ${index}`);
  });
  // Reset if we change the version of the module
  hash.update(packageIdentifier);
  // Reset if we deploy a new commit
  hash.update(commit);
  hash.update(givenKey);
  return hash.digest().toString("hex");
}

export async function addCachedPage(url: string, value: string) {
  const fullUrl = new URL(url, getOrigin()).toString();
  return addCached({
    key: fullUrl,
    value,
    expiresAt: getExpiresAt(PAGE_EXPIRES_IN_MS),
  });
}

export async function getCachedPage(url: string) {
  const fullUrl = new URL(url, getOrigin()).toString();
  return getCached<string>(fullUrl);
}

export async function addExpiring(data: Omit<CacheData, "type">) {
  return addCached({
    ...data,
    type: "expiring",
  });
}

export async function addCached(data: CacheData) {
  const store = getCacheStore<unknown>();
  const roles = getSortedRoles();
  const key = getCacheKey(data.key, data.role !== false ? roles : []);
  const counter = await getGlobalCount();
  const type = data.type || "counter";
  const cached: Cached = {
    ...data,
    role: data.role !== false,
    type,
    expiresAt: getExpiresAt(DEFAULT_EXPIRES_IN_MS, data.expiresAt),
    createdAt: new Date().toISOString(),
    roles,
    counter,
    counterType: "global",
  };
  await store.set(key, cached);
}

export async function getCached<T = string>(
  givenKey: string
): Promise<T | undefined> {
  const store = getCacheStore<T>();
  const roles = getSortedRoles();
  const key = getCacheKey(givenKey, roles);
  const countPromise = getGlobalCount();
  const value = await store.get(key);
  if (!value) return undefined;
  if (!value.type || value.type === "counter") {
    const counter = await countPromise;
    if (value.counter !== counter) return undefined;
  }
  if (value.role !== false) {
    if (value.roles.length !== roles.length) return undefined;
    const everyRoleSame = roles.every((role) => value.roles.includes(role));
    // Just one last check just to be absolutely sure
    if (!everyRoleSame) {
      console.warn(
        "Cache key somehow isn't restricting users to a single role view of objects"
      );
      console.warn(
        "Users should only be able to access the cache for their exact role set"
      );
      return undefined;
    }
  }
  return value.value;
}
