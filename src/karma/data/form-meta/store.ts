import { getKeyValueStore } from "../kv";
import { FormMeta } from "./types";

const STORE_NAME = "formMeta";

export function getFormMetaStore() {
  return getKeyValueStore<FormMeta>(STORE_NAME, {
    counter: false,
  });
}
