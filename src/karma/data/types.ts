export type * from "./data";

export interface KeyValueStore<T> {
    name: string;
    get(key: string): Promise<T | undefined>
    set(key: string, value: T): Promise<void>
    values(): Promise<T[]>
}