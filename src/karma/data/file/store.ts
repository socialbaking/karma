import { getKeyValueStore } from "../storage";
import {File, FileType} from "./types";
import {ok} from "../../../is";

const STORE_NAME = "file";
// productFile, namedFile
const NAMED_STORE_SUFFIX = "File";

export const NAMED_FILE_TYPE: FileType[] = [
    "product"
];
const FILE_NAMES: string[] = NAMED_FILE_TYPE;

export function isNamedFileType(type: string): type is FileType {
  return FILE_NAMES.includes(type)
}

export function getFileStore() {
  return getKeyValueStore<File>(STORE_NAME, {
    counter: false,
  });
}

export function getNamedFileStore(name: string, prefix: string) {
  ok(isNamedFileType(name), `Expected "${name}" to be one of "${NAMED_FILE_TYPE.join(", ")}"`);
  ok(prefix);
  return getKeyValueStore<File>(`${name}${NAMED_STORE_SUFFIX}`, {
    counter: false,
    prefix
  });
}
