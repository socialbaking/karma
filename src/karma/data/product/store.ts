import { getKeyValueStore } from "../kv";
import { Product } from "./types";

const STORE_NAME = "product" as const;

export function getProductStore() {
  return getKeyValueStore<Product>(STORE_NAME);
}
