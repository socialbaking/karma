import { FileData } from "./types";
import { setFile } from "./set-file";

export function addFile(data: FileData) {
  return setFile(data);
}
