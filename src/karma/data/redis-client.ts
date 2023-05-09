import {KeyValueStore} from "./types";
import {createClient, RedisClientType} from "redis";

const GLOBAL_CLIENTS = new Map();
const GLOBAL_CLIENT_CONNECTION_PROMISE = new WeakMap();

export function isRedis() {
    return !!getRedisUrl();
}

export function isRedisMemory() {
    return !!process.env.REDIS_MEMORY;
}

export function getRedisUrl() {
    return process.env.REDIS_URL;
}

export function getGlobalRedisClient() {
    const url = getRedisUrl();
    const existing = GLOBAL_CLIENTS.get(url);
    if (existing) {
        return existing;
    }
    const client = createClient({
        url
    });
    client.on("error", console.warn);
    GLOBAL_CLIENTS.set(url, client);
    return client;
}

export async function connectGlobalRedisClient(client: RedisClientType) {
    if (client.isOpen) {
        return client;
    }
    const existingPromise = GLOBAL_CLIENT_CONNECTION_PROMISE.get(client);
    if (existingPromise) return existingPromise;
    const promise = client.connect();
    GLOBAL_CLIENT_CONNECTION_PROMISE.set(client, promise);
    promise.finally(() => {
        if (promise === GLOBAL_CLIENT_CONNECTION_PROMISE.get(client)) {
            GLOBAL_CLIENT_CONNECTION_PROMISE.delete(client)
        }
    })
    return promise;
}

// export async function getRedisClient() {
//     const client = getGlobalRedisClient();
//     await connectGlobalRedisClient(client);
//     return client;
// }

export function createRedisKeyValueStore<T>(name: string): KeyValueStore<T> {
    const client = getGlobalRedisClient();

    async function connect() {
        return connectGlobalRedisClient(client);
    }

    function getPrefix() {
        return `${name}::`
    }

    function getKey(key: string): string {
        return `${getPrefix()}${key}`;
    }

    async function get(key: string): Promise<T | undefined> {
        return internalGet(getKey(key));
    }

    async function internalGet(actualKey: string): Promise<T | undefined> {
        await connect();
        const value = await client.get(actualKey);
        if (!value) return undefined;
        return JSON.parse(value);
    }

    async function set(key: string, value: T): Promise<void> {
        await connect();
        const json = JSON.stringify(value);
        await client.set(getKey(key), json);
    }

    async function values(): Promise<T[]> {
        await connect();
        const keys = await client.keys(`${getPrefix()}*`);
        return await Promise.all(
            keys.map((key: string) => internalGet(key))
        );
    }

    async function *asyncIterable(): AsyncIterable<T> {
        await connect();
        const keys = await client.keys(`${getPrefix()}*`);
        for (const key of keys) {
            yield await internalGet(key);
        }
    }

    async function deleteFn(key: string): Promise<void> {
        await connect();
        await client.del(key);
    }

    async function has(key: string): Promise<boolean> {
        await connect();
        return client.exists(key);
    }

    return {
        name,
        get,
        set,
        values,
        delete: deleteFn,
        has,
        [Symbol.asyncIterator]() {
            return asyncIterable()[Symbol.asyncIterator]()
        }
    }
}