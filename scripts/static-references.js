import {mkdir, readFile, writeFile} from "fs/promises"
import {join} from "node:path";
import * as esbuild from 'esbuild'
import {readdirSync, statSync} from "node:fs";

const packageString = await readFile("package.json", "utf-8");
const { staticReferences } = JSON.parse(packageString);

function isDirectory(path) {
    try {
        const stat = statSync(path);
        return stat.isDirectory()
    } catch {
        return false;
    }
}

function readdirRecursive(path) {
    try {
        const paths = readdirSync(path)
            .filter(name => ![".git", "node_modules", ".env", ".cache", ".github", ".idea", "coverage"].includes(name))
            .map(name => join(path, name));

        const directories = paths.filter(isDirectory);
        const files = paths.filter(path => !directories.includes(path));

        const info = directories.map(readdirRecursive).filter(Boolean);

        return {
            path,
            directories: info,
            files
        };
    } catch {
        return undefined;
    }
}

function getFiles(staticReferences) {

    return staticReferences
        .flatMap(getFilesForPath)

    function getFilesForPath(path) {
        if (!isDirectory(path)) {
            return [path];
        }
        const all = readdirRecursive(path);
        return flatten(all);

        function flatten(directory) {
            if (!directory) return [];
            return [
                ...directory.files,
                ...directory.directories.flatMap(flatten)
            ];
        }
    }
}

async function createStaticReferences(staticReferences) {

    const buildRoot = "esnext";

    const importReferences = getFiles(staticReferences)
        .map((file) => file.includes(buildRoot) ?
            `await import("${file.replace(`./${buildRoot}`, ".")}");` :
            `await import("../${file}");`
        )
        .join("\n");

    const referenceFile = `
    export async function staticReferences() { 
    try {
    ${importReferences}
    } catch {
    
    }
    }`.trim();

    await writeFile(
        `${buildRoot}/static-references.js`,
        `${referenceFile}\n`,
        "utf-8"
    );
}

if (staticReferences) {
    await createStaticReferences(staticReferences);
}