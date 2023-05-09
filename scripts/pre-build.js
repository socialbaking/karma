import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { replaceBetween } from "./replace-between.js";

const PATH = "./src/karma/data"
const CLIENT_INTERFACE_GENERATED_PATH = "./src/karma/client/interface.readonly.ts"
const CLIENT_INTERFACE_PATH = "./src/karma/client/client.interface.ts"
const IGNORE_TYPES = [
    "access-token",
    "background",
    "metrics"
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

// console.log(types);


await writeFile(
    CLIENT_INTERFACE_GENERATED_PATH,
    types,
    "utf-8"
);

let client = await readFile(CLIENT_INTERFACE_PATH, "utf-8");

client = client
    .replace(/^\/\/.+/mg, "")
    .replace(/^import\s*.+/mg, "")

const interfaceContents = [client, types].map(value => value.trim()).join("\n\n");

await replaceBetween("README.md", "typescript client", `\`\`\`typescript\n${interfaceContents}\n\`\`\``)