import {getFileStore, getNamedFileStore} from "./store";
import {FileType} from "./types";

export function getFile(fileId: string) {
  const store = getFileStore();
  return store.get(fileId);
}

export function getNamedFile(type: FileType, typeId: string, fileId: string) {
  const store = getNamedFileStore(type, typeId);
  return store.get(fileId);
}