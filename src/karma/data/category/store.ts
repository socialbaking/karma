import { getKeyValueStore } from "../storage";
import { Category } from "./types";
const STORE_NAME = "category";

export function getCategoryStore() {
  return getKeyValueStore<Category>(STORE_NAME);
}
