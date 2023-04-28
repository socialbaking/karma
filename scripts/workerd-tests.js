import { test } from "../workerd-tests.capnp.js";
import { readFile, writeFile } from "fs/promises";
import { STATEMENT_REGEX } from "./correct-import-extensions.js";
import {dirname, resolve} from "path";
// const test :Workerd.Worker = (
//     modules = [
//         (name = "esnext-workerd/tests/workerd/test.js", esModule = embed "esnext-workerd/tests/workerd/test.js")
// ],
// compatibilityDate = "2022-09-16",
// );


let capnp = await readFile("workerd-tests.template.capnp", "utf-8");

const cwd = process.cwd();

async function getImportUrls(moduleUrl, seen) {

    const directory = dirname(moduleUrl);

    const file = await readFile(moduleUrl, "utf-8").catch(error => {
        console.error(`Can't read ${moduleUrl}`);
        // throw error;
        return "";
    });

    if (!file) return [];

    const statements = file.match(STATEMENT_REGEX);

    if (!statements?.length) return [];

    const urls = statements
        .map(statement => statement.match(/"(.+)"/)[1])
        .filter(Boolean)
        .map(url => resolve(directory, url).replace(`${cwd}/`, ""))

    // console.log("this one", {
    //     statements,
    //     urls,
    //     moduleUrl
    // });

    const nextSeen = new Set([
        ...seen,
        ...urls
    ]);
    return [
        ...urls,
        ...(
            await Promise.all(
                urls
                    .filter(url => !seen.has(url))
                    .map(url => getImportUrls(url, nextSeen))
            )
        ).reduce((sum, array) => sum.concat(array), [])
    ];
}

const { modules: testModules, ...rest } = test;

let importUrls = new Set();

for (const { esModule } of test.modules) {
    if (!esModule?.embed) { throw "Expected esModule embed only"; }
    const moduleImportUrls = await getImportUrls(esModule.embed, importUrls);
    importUrls = new Set([
        ...importUrls,
        esModule.embed,
        ...moduleImportUrls
    ]);
}


// console.log([...importUrls].join("\n"));

const modulesString = `modules = [
    ${
        [...importUrls]
            .map(url => `(name = "${url}", esModule = embed "${url}")`)
            .join(",\n")
    }
]`;

const workerString = `
const test :Workerd.Worker = (
  ${modulesString},
  ${Object.entries(rest).map(([key, value]) => `${key} = ${JSON.stringify(value)}`).join("\n,")}
);
`

await writeFile("workerd-tests.capnp", `${capnp}\n${workerString}`, "utf-8");