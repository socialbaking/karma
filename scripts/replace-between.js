import {promises as fs} from "node:fs";

export async function replaceBetween(fileName, tagName, content) {
    const tag = `[//]: # (${tagName})`;

    const readMe = await fs.readFile(fileName, "utf8");
    const badgeStart = readMe.indexOf(tag);
    const badgeStartAfter = badgeStart + tag.length;
    if (badgeStart === -1) {
        console.warn(`Expected to find "${tag}" in ${fileName}`);
        return;
    }
    const badgeEnd = badgeStartAfter + readMe.slice(badgeStartAfter).indexOf(tag);
    const badgeEndAfter = badgeEnd + tag.length;
    const fileBefore = readMe.slice(0, badgeStart);
    const fileAfter = readMe.slice(badgeEndAfter);

    const fileNext = `${fileBefore}${tag}\n\n${content}\n\n${tag}${fileAfter}`;
    await fs.writeFile(fileName, fileNext);
}

export const VARIABLES_REPLACE_AFTER_TEST_COMMENT = "// Variables to be replaced after tests";