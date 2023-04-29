import { requestContext } from "@fastify/request-context";
import {KVS, StorageSchema} from "@kvs/types";
import {kvsEnvStorage} from "@kvs/env";
import { createClient } from "redis";

const DATABASE_VERSION = 1;

interface GenericStorageFn {
    (): Promise<KVS<StorageSchema>>
}

export function getKeyValueStore<T>(name: string): KeyValueStore<T> {
    return getRequestContextKeyValueStoreWithName<T>(name);
}

function getRequestContextKeyValueStoreWithName<T>(name: string): KeyValueStore<T> {
    const key = `kvStore#${name}`;
    const store = get();
    if (store) return store;
    return create();

    function get(): KeyValueStore<T> | undefined {
        return requestContext.get(key);
    }

    function create() {
        let store: Promise<KVS<StorageSchema>> = undefined;
        let kv;
        if (getRedisUrl()) {
            console.log("client in use");
            kv = createRedisKeyValueStore<T>(name);
        } else {
            kv = createKeyValueStore<T>(() => {
                if (store) {
                    return store;
                }
                return store = kvsEnvStorage({
                    name,
                    version: DATABASE_VERSION
                })
            })
        }
        requestContext.set(key, kv);
        return kv;
    }
}

export interface KeyValueStore<T> {
    get(key: string): Promise<T | undefined>
    set(key: string, value: T): Promise<void>
    values(): Promise<T[]>
}

function getRedisUrl() {
    return process.env.REDIS_URL;
}

function createRedisKeyValueStore<T>(name: string): KeyValueStore<T> {
    const url = getRedisUrl();
    const client = createClient({
        url
    });

    let connectPromise: Promise<void> | undefined = undefined;

    async function connect() {
        if (connectPromise) return connectPromise;
        return connectPromise = client.connect();
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
            keys.map(key => internalGet(key))
        );
    }

    return {
        get,
        set,
        values
    }
}

function createKeyValueStore<T>(storage: GenericStorageFn): KeyValueStore<T> {
    async function get(key: string): Promise<T | undefined> {
        const store = await storage();
        return store.get(key);
    }

    async function set(key: string, value: T): Promise<void> {
        const store = await storage();
        await store.set(key, value)
    }

    async function values(): Promise<T[]> {
        const values = [];
        const store = await storage();
        for await (const [,value] of store) {
            values.push(value)
        }
        return values;
    }

    return {
        get,
        set,
        values
    }
}
