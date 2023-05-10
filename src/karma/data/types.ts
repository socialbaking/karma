export type * from "./data";

export interface KeyValueStore<T> extends AsyncIterable<T> {
    name: string;
    get(key: string): Promise<T | undefined>
    set(key: string, value: T): Promise<void>
    values(): Promise<T[]>
    keys(): Promise<string[]>
    delete(key: string): Promise<void>
    has(key: string): Promise<boolean>
    clear(): Promise<void>;
}