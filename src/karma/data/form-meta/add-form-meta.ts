import { FormMetaData } from "./types";
import { setFormMeta } from "./set-form-meta";

export function addFormMeta(data: FormMetaData) {
  return setFormMeta(data);
}
