import {connectGlobalRedisClient, getGlobalRedisClient, isRedis, isRedisMemory} from "./redis-client";
import createLockClient from "redis-lock";
import {UnlockFn} from "redis-lock";

const globalRedis = isRedis() ? getGlobalRedisClient() : undefined;
const globalLock = globalRedis ? createLockClient(globalRedis) : undefined;

export function isLocking() {
    return (globalRedis && globalLock) && !isRedisMemory();
}

export async function lock(name: string): Promise<UnlockFn> {

    if (!(globalRedis && globalLock) || isRedisMemory()) {
        // noop for now
        return async () => void 0;
    }

    await connectGlobalRedisClient(globalRedis);

    return globalLock(name);

}