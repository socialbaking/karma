import { getCategoryStore } from "./store";
import { Category } from "./types";

export async function getCategory(
  categoryId: string
): Promise<Category | undefined> {
  const store = getCategoryStore();
  return store.get(categoryId);
}
