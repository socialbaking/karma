import { getFormMetaStore } from "./store";

export function listFormMeta() {
  const store = getFormMetaStore();
  return store.values();
}
