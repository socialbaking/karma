import {stopRedis} from "./redis-client";

export * from "./redis-memory";

export async function stopData() {
    await stopRedis();
}