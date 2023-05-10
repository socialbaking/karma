import type { RedisMemoryServer } from "redis-memory-server";
import {ok} from "../../is";

export function isRedisMemory() {
    return !!process.env.REDIS_MEMORY;
}

let redisServer: RedisMemoryServer | undefined = undefined,
    initialURL: string | undefined = undefined;

export async function stopRedisMemory() {
    if (!redisServer) return;
    await redisServer.stop();
    process.env.REDIS_URL = initialURL ?? "";
    redisServer = undefined;
    initialURL = undefined;
}

export async function startRedisMemory() {
    if (redisServer) return;
    const { RedisMemoryServer } = await import("redis-memory-server")
    redisServer = new RedisMemoryServer();

    const host = await redisServer.getHost();
    const port = await redisServer.getPort();

    initialURL = process.env.REDIS_URL;
    process.env.REDIS_URL = `redis://${host}:${port}`;
}