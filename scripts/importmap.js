import {mkdir, readFile, writeFile} from "fs/promises"
import {join} from "node:path";
import * as esbuild from 'esbuild'

const packageString = await readFile("package.json", "utf-8");
const { importmap } = JSON.parse(packageString);

function getESMExportOrDefault(packageJSON) {
    const mainExport = packageJSON.exports?.["."];
    if (!mainExport) {
        if (packageJSON.type === "module" && packageJSON.module) {
            return packageJSON.module;
        }
        if (packageJSON.main && typeof packageJSON.main === "string") {
            return packageJSON.main;
        }
    } else {
        /*
        "exports": {
          ".": "./esnext/index.js"
        }
         */
        if (typeof mainExport === "string") {
            return mainExport;
        }
        /*
        "exports": {
          ".": {
            "default": "./index.js"
          }
        }
         */
        if (typeof mainExport.default === "string") {
            return mainExport.default;
        }
    }
    throw new Error(`Could not get main export of ${packageJSON.name}`);
}

async function createImportsFromArray(importmap) {
    const entries = [];
    for (const key of importmap.imports) {
        const modulePath = join("node_modules", key);
        const modulePackageFile = await readFile(join(modulePath, "package.json"), "utf-8");
        const mainFile = getESMExportOrDefault(JSON.parse(modulePackageFile));
        const mainPath = join(modulePath, mainFile);
        entries.push([key, mainPath]);
    }
    return createImports({
        ...importmap,
        imports: Object.fromEntries(entries)
    });
}

async function createImports(importmap) {
    if (Array.isArray(importmap.imports)) {
        return createImportsFromArray(importmap);
    }

    const entries = [];

    const root = importmap.root || "esnext/.imports";

    await mkdir(root, {
        recursive: true
    })

    for (const [key, value] of Object.entries(importmap.imports)) {
        if (typeof value !== "string") continue;
        const target = join(root, `${key}.js`)
        await esbuild.build({
            entryPoints: [value],
            bundle: true,
            format: "esm",
            outfile: target,
        })
        // The path is expected to be served from top level
        entries.push([key, `/${target.replace(/^\.\//, "")}`]);
    }

    const imports = Object.fromEntries(entries);
    await writeFile(
        join(root, "importmap.json"),
        JSON.stringify({
            imports
        }, undefined, "  "),
        "utf-8"
    );
}

if (importmap) {
    await createImports(importmap);
}