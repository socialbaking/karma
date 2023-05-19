import { getCategoryStore } from "./store";
import { Category } from "./types";

export async function listCategories(): Promise<Category[]> {
  const store = getCategoryStore();
  return store.values();
}
