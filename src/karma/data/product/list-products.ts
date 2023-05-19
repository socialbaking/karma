import { Product } from "./types";
import { getProductStore } from "./store";

export interface ListProductsInput {}

export async function listProducts({}: ListProductsInput = {}): Promise<
  Product[]
> {
  const store = getProductStore();
  return store.values();
}
