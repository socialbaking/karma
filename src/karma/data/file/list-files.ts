import { getFileStore } from "./store";

export function listFiles() {
  const store = getFileStore();
  return store.values();
}
