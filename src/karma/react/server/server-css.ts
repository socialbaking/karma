import { join, dirname } from "node:path";
import { readFile } from "node:fs/promises";

const { pathname } = new URL(import.meta.url);

const path = join(dirname(pathname), "server.css");

export default await readFile(path, "utf-8");
