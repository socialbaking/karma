import { requestContext } from "@fastify/request-context";
import {KVS, StorageSchema} from "@kvs/types";
import {kvsEnvStorage} from "@kvs/env";

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
        const kv = createKeyValueStore<T>(() => {
            if (store) {
                return store;
            }
            return store = kvsEnvStorage({
                name,
                version: DATABASE_VERSION
            })
        })
        requestContext.set(key, kv);
        return kv;
    }
}

export interface KeyValueStore<T> {
    get(key: string): Promise<T | undefined>
    set(key: string, value: T): Promise<void>
    values(): Promise<T[]>
}

function createKeyValueStore<T>(storage: GenericStorageFn): KeyValueStore<T> {
    async function get(key: string): Promise<T> {
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
