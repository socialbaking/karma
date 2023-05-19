import { getFormMetaStore } from "./store";

export function getFormMeta(formMetaId: string) {
  const store = getFormMetaStore();
  return store.get(formMetaId);
}
