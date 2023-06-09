import { getKeyValueStore } from "../storage";
import { Product } from "./types";

const STORE_NAME = "product" as const;

export function getProductStore<P extends Product = Product>() {
  return getKeyValueStore<P>(STORE_NAME);
}
