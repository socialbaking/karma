import {getFileStore, getNamedFileStore} from "./store";
import {FileType} from "./types";

export function listFiles() {
  const store = getFileStore();
  return store.values();
}

export function listNamedFiles(type: FileType, typeId: string) {
  const store = getNamedFileStore(type, typeId);
  return store.values();
}