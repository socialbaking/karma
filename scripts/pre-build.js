import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { replaceBetween } from "./replace-between.js";

const PATH = "./src/karma/data"
const CLIENT_INTERFACE_PATH = "./src/karma/client/interface.readonly.ts"
const IGNORE_TYPES = [
    "access-token",
    "background"
];

const paths = await readdir(PATH)

const types = (
    await Promise.all(
        paths
            .filter(name => !IGNORE_TYPES.includes(name))
            .map(
                async (name) => {
                    const path = join(PATH, name);
                    const pathStat = await stat(path).catch(() => undefined);
                    if (!pathStat) return "";
                    if (!pathStat.isDirectory()) return "";

                    const typesPath = join(path, "types.ts");
                    const typesStat = await stat(typesPath).catch(() => undefined);
                    if (!typesStat) return "";
                    if (!typesStat.isFile()) return "";

                    const typesFile = await readFile(typesPath, "utf-8");

                    // Assume all imports are to other types that will be contained in this file
                    // If not the build will fail :)
                    return typesFile
                        .replace(/(import|export).+from.+/mg, "")
                }
            )
    )
)
    .filter(Boolean)
    .map(value => value.trim())
    .join("\n\n")

console.log(types);

const interfaceContents = [types].join("\n\n");

await writeFile(
    CLIENT_INTERFACE_PATH,
    interfaceContents,
    "utf-8"
);

// const interfaceContents = await readFile("esnext/karma/client/interface.d.ts", "utf-8");

await replaceBetween("README.md", "typescript client", `\`\`\`typescript\n${interfaceContents.trim()}\n\`\`\``)