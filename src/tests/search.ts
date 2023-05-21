import { getMatchingProducts } from "../karma/utils";
import {listCategories, listOrganisations, listProducts} from "../karma/data";
import { readFile } from "node:fs/promises";
import { parse } from "csv-parse/sync";
import { ok } from "../is";

const csvFile = await readFile("src/tests/search.csv", "utf-8").catch(() => "")

if (csvFile) {
    const searchRows: ({ text: string, name: string })[] = parse(csvFile, {
        columns: true
    })

    const products = await listProducts();
    const organisations = await listOrganisations();
    const categories = await listCategories();

    for (const { text, name } of searchRows) {
        console.log({ text, name });
        const matching = getMatchingProducts(products, organisations, categories, text);
        console.log({ text, name, matching });
        ok(matching.length, `Expected to find match for ${text}`);
        const names = name.split("|");
        ok(matching.length >= names.length, `Expected to find unique products for ${names.join(", ")}`);
        if (names.length === 1) {
            ok(matching.length === 1, `Expected to find one match for ${text}, found ${matching.map(value => value.productName).join(", ")}`)
        }
        for (const name of names) {
            const match = matching.find(product => product.productName === name);
            ok(match, `Expected to find match for ${text}: ${name}`);
        }
    }


}