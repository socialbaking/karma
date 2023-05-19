import {Expiring} from "../expiring";

export interface CacheData<T = unknown> extends Expiring {
    value: T;
    key: string;
    type?: string;
}

export interface Cached<T = unknown> extends CacheData<T> {
    roles: string[];
    counter: number;
    counterType: "store" | "global"
    createdAt: string;
}