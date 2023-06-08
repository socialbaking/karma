import { getProductStore } from "./store";
import {Product} from "./types";

export function getProduct<P extends Product = Product>(id: string) {
  const store = getProductStore<P>();
  return store.get(id);
}
