import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {replaceBetween, VARIABLES_REPLACE_AFTER_TEST_COMMENT} from "./replace-between.js";
import gitCommitInfo from "git-commit-info";
import ago from "s-ago";

const SOURCE_MAPPING_COMMENT = "//# sourceMappingURL=";

const PACKAGE_GENERATED_PATH_SOURCE = "./src/karma/package.readonly.ts"
const PACKAGE_GENERATED_PATH_BUILD = "./esnext/karma/package.readonly.js"

{

    async function replaceValuesInFile(path) {

        const file = await readFile(path, "utf-8")

        const sourceMappingLine = file.split("\n").find(line => line.startsWith(SOURCE_MAPPING_COMMENT));

        const [preTest] = file.split(VARIABLES_REPLACE_AFTER_TEST_COMMENT);

        const {
            timeBetweenCommitAndBuild,
            secondsBetweenCommitAndBuild,
            minutesBetweenCommitAndBuild
        } = await import("./git-info.js");

        let joined = [
            preTest.trimEnd(),
            `
export const secondsBetweenCommitAndTestCompletion = "${secondsBetweenCommitAndBuild}";
export const minutesBetweenCommitAndTestCompletion = "${minutesBetweenCommitAndBuild}";
export const timeBetweenCommitAndTestCompletion = "${timeBetweenCommitAndBuild}";
        `.trim()
        ].join(`\n${VARIABLES_REPLACE_AFTER_TEST_COMMENT}\n`);

        if (sourceMappingLine) {
            joined += `\n${sourceMappingLine}`;
        }

        await writeFile(path, joined, "utf-8");
    }

    await replaceValuesInFile(PACKAGE_GENERATED_PATH_SOURCE)
    await replaceValuesInFile(PACKAGE_GENERATED_PATH_BUILD)

}