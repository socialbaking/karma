import { getKeyValueStore } from "../kv";
import { File } from "./types";

const STORE_NAME = "file";

export function getFileStore() {
  return getKeyValueStore<File>(STORE_NAME, {
    counter: false,
  });
}
