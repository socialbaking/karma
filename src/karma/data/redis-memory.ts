import type { RedisMemoryServer } from "redis-memory-server";
import { ok } from "../../is";

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
  const mod = await import("redis-memory-server").catch(() => undefined);
  if (!mod) {
    console.warn("Redis memory enabled but redis-memory-server not installed");
    return;
  }
  const { RedisMemoryServer } = mod;
  redisServer = new RedisMemoryServer();

  const host = await redisServer.getHost();
  const port = await redisServer.getPort();

  initialURL = process.env.REDIS_URL;
  process.env.REDIS_URL = `redis://${host}:${port}`;
}
