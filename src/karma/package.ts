import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  commit,
  commitAt,
  commitAuthor,
  commitEmail,
  timeBetweenCommitAndBuild,
} from "./package.readonly";
import { ok } from "../is";

const { pathname } = new URL(import.meta.url);
const directory = dirname(pathname);

export const root = join(directory, "../../")

const packageJSON = await readFile(
  join(root, "./package.json"),
  "utf-8"
);
const packageInfo = JSON.parse(packageJSON);

/*
[Error: ENOENT: no such file or directory, open '/var/task/node_modules/@socialbaking/karma/esnext/.imports/importmap.json'] {
  errno: -2,
  code: 'ENOENT',
  syscall: 'open',
  path: '/var/task/node_modules/@socialbaking/karma/esnext/.imports/importmap.json'
}
RequestId: 71dcdda2-2880-472c-9746-31874917e646 Error: Runtime exited with error: exit status 1
Runtime.ExitError
 */

export const name: string = packageInfo.name;
const splitName = name.split("/");
ok(splitName.length === 2, "Expected namespaced package");
export const namespace: string = splitName[0].replace(/^@/, "");
export const project: string = splitName[1];
export const description: string = packageInfo.description || "";
export const version: string = packageInfo.version;
export const packageIdentifier = `${name}@${version}`;
export const homepage: string = packageInfo.homepage;
export const bugsUrl: string = packageInfo.bugs?.url ?? homepage;
export const importmapRootName: string = packageInfo.importmap?.root ?? "esnext/imports";
export const importmapRoot: string = join(root, importmapRootName);
export const importmapPath: string = join(importmapRoot, "importmap.json");
export const importmapJSON = await readFile(
    importmapPath,
    "utf-8"
);
export const importmap = JSON.parse(importmapJSON);

export * from "./package.readonly";

export function logPackage() {
  console.log({
    packageIdentifier,
    homepage,
    commit,
    commitAt,
    commitAuthor,
    commitEmail,
    timeBetweenCommitAndBuild,
  });
}
