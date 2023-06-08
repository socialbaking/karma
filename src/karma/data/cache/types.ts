import { Expiring } from "../expiring";

type CachingType = "counter" | "expiring";

export interface CacheData<T = unknown> extends Expiring {
  value: T;
  key: string;
  type?: CachingType;
  role?: boolean;
  // Indicates that the key is stable and does not need to be
  // reset over package revisions
  stable?: boolean;
}

export interface Cached<T = unknown> extends CacheData<T> {
  type: CachingType;
  roles: string[];
  counter: number;
  counterType: "store" | "global";
  createdAt: string;
}
