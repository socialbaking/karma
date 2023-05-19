import { Expiring } from "../expiring";

type CachingType = "counter" | "expiring";

export interface CacheData<T = unknown> extends Expiring {
  value: T;
  key: string;
  type?: CachingType;
  role?: boolean;
}

export interface Cached<T = unknown> extends CacheData<T> {
  type: CachingType;
  roles: string[];
  counter: number;
  counterType: "store" | "global";
  createdAt: string;
}
