import {KeyValueStore} from "./types";
import {getBaseKeyValueStore} from "./kv-base";
import {ok} from "../../is";

export const GLOBAL_STORE_NAME = "global";
export const GLOBAL_COUNT_NAME = "globalCount";

export interface KeyValueStoreWithCounter<T> extends KeyValueStore<T> {
    counters: {
        store: KeyValueStore<number>
        global: KeyValueStore<number>
    };
}

export interface KeyValueStoreOptions {
    counter?: boolean;  // To disable set to false
}


export function getKeyValueStore<T>(name: string, options: KeyValueStoreOptions & { counter: false }): KeyValueStore<T>
export function getKeyValueStore<T>(name: string, options?: KeyValueStoreOptions): KeyValueStoreWithCounter<T>
export function getKeyValueStore<T>(name: string, options?: KeyValueStoreOptions): KeyValueStore<T> & Partial<KeyValueStoreWithCounter<T>> {
    const store = getBaseKeyValueStore<T>(name);
    const counters = options?.counter !== false ? {
        store: getCounterStore(name),
        global: getGlobalCounterStore()
    } : undefined;
    return {
        ...store,
        counters,
        async set(key: string, value: T) {
            await counters?.global.increment(GLOBAL_COUNT_NAME);
            await counters?.store.increment(key);
            return store.set(key, value);
        }
    }
}

export function getCounterStoreName(baseName: string): `${string}Counter` {
    return `${baseName}Counter`;
}

export function getCounterStore(name: string): KeyValueStore<number> {
    return getBaseKeyValueStore<number>(
        getCounterStoreName(name)
    );
}

export function getGlobalCounterStore() {
    return getCounterStore(GLOBAL_STORE_NAME);
}

export async function getGlobalCount() {
    const store = getGlobalCounterStore();
    const count = await store.get(GLOBAL_COUNT_NAME);
    ok(typeof count === "number", "Expected global count value");
    return count;
}