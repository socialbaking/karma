import {connectGlobalRedisClient, getGlobalRedisClient, isRedis, isRedisMemory} from "./redis-client";
import createLockClient, {LockFn} from "redis-lock";
import {UnlockFn} from "redis-lock";
import {RedisClientType} from "redis";

const GLOBAL_LOCKS = new WeakMap<RedisClientType, LockFn>();

export function isLocking() {
    return !!getGlobalLock();
}

export async function lock(name: string): Promise<UnlockFn> {
    const fn = getGlobalLock();

    if (!fn) {
        // noop for now
        return createFakeLock()
    }

    return fn(name);

}

export function createFakeLock(): UnlockFn {
    return async () => {
        return void 0; // noop
    }
}

export function getGlobalLock(): LockFn | undefined {
    if (isRedisMemory()) return undefined;
    if (!isRedis()) return undefined;
    const globalRedisClient = getGlobalRedisClient();
    const existing = GLOBAL_LOCKS.get(globalRedisClient);
    if (existing) return existing;
    const fn = createLockClient(globalRedisClient);
    GLOBAL_LOCKS.set(globalRedisClient, fn);
    return async (name: string) => {
        await connectGlobalRedisClient(globalRedisClient);
        return fn(name);
    };
}