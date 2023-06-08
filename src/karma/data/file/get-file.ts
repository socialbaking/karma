import { getFileStore } from "./store";

export function getFile(fileId: string) {
  const store = getFileStore();
  return store.get(fileId);
}
