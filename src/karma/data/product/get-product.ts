import { getProductStore } from "./store";

export function getProduct(id: string) {
  const store = getProductStore();
  return store.get(id);
}
