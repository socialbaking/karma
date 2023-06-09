import { getProductStore as getStore } from "@opennetwork/logistics";
import { Product } from "./types";

export function getProductStore<P extends Product = Product>() {
  return getStore<P>();
}
