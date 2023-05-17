import {packageIdentifier} from "../../../package";
import {HEALTH_GOVT_NZ_MINIMUM_PRODUCTS} from "../../../static";
import {AcceptedFilters, AnyNode, Cheerio, CheerioAPI, load, Element} from "cheerio"
import {ok} from "../../../../is";
import {
    seedCategories,
    categories,
    seedPartners,
    getOrganisation,
    namespace,
    updatedAt,
    createdAt
} from "./static-initial";
import {Product, setProduct} from "../../product";
import {v5} from "uuid";

const USER_AGENT = `A Patient Collective, running ${packageIdentifier}`;
const HEADERS = {
    "User-Agent": USER_AGENT
};

export async function seed() {

    // Use the static categories shared between
    // We will use this to auto categorise into these categories
    // As short names for remote categories
    await seedCategories();

    // Partners and organisations are internal, so we do this either way
    await seedPartners();

    await seedFromHealthNZ();
}

export async function seedFromHealthNZ() {
    const response = await fetch(
        HEALTH_GOVT_NZ_MINIMUM_PRODUCTS,
        {
            headers: {
                ...HEADERS
            }
        }
    );
    const text = await response.text();
    const $ = load(text);

    await seedHealthNZProducts($);

}

type TableRow = Record<string, string>;


interface RemoteTableInfo {
    sectionText: string;
    sectionInfo: string[];
    headerText?: string;
    headerInfo?: string[];
    subheaderText?: string;
    subheaderInfo?: string[];
    rows: TableRow[];
    $table?: Cheerio<AnyNode>
}

async function seedHealthNZProducts($: CheerioAPI) {
    const tables = getHealthNZTables($);

    console.log(`Have ${tables.length} tables to process`);
    // console.log(tables);

    const productPromises = tables
        .flatMap((table: RemoteTableInfo) => {
            const category = findCategory(table);
            const categoryId = category?.categoryId;

            return table.rows.map(
                async (row): Promise<Product> => {
                    const productName = row["Product Name"];
                    const activeIngredients = row["Active Ingredients"];
                    const sizes = row["Pack Sizes (g)"] || row["Pack Sizes (mL)"] || row["Pack Sizes (mg)"];
                    const notes = row["Administration notes"];
                    const licenceHolderName = row["Licence holder"];
                    const licenceHolder = licenceHolderName ? getOrganisation(licenceHolderName) : undefined;
                    const sponsorName = row["Sponsor"];
                    const sponsor = sponsorName ? getOrganisation(sponsorName) : undefined

                    ok(productName);
                    ok(activeIngredients);
                    ok(licenceHolder || sponsor);

                    const product: Product = {
                        categoryId,
                        productId: v5(productName, namespace),
                        productName,
                        createdAt,
                        updatedAt,
                        licenceCountryCode: licenceHolder?.countryCode,
                        licencedOrganisationId: licenceHolder?.organisationId,
                        licenceApprovalWebsite: HEALTH_GOVT_NZ_MINIMUM_PRODUCTS,
                        activeIngredientDescriptions: splitDescriptions()
                    };

                    return setProduct(product);

                    function splitDescriptions() {
                        if (!activeIngredients) return undefined;
                        const split = activeIngredients
                            .split("\n")
                            .map(value => value.trim())
                            .filter(Boolean);
                        // If we get a good split early, it's got good data
                        if (split.length > 1) return split;
                        // If we split at "Total", each item will be a total followed by some details
                        // We should add total back to each value
                        const totalSplitValue = "Total ";
                        const totalSplit = activeIngredients
                            .split(totalSplitValue)
                            .map(value => value.trim())
                            .filter(Boolean)
                            .map(value => `${totalSplitValue}${value}`);
                        // If its no different then its just one line anyway, but good to check
                        // We should just use the original provided
                        if (totalSplit.length <= 1) return split;
                        return totalSplit;
                    }
                }
            )
        });

    const products = await Promise.all(productPromises);
    for (const product of products) {
        console.log(product.productName);
        console.log(product.activeIngredientDescriptions?.join("\n"));
        console.log(product.activeIngredients)
    }
    return products;

    function findCategory(table: RemoteTableInfo) {
        const headerLower = table.headerText?.toLowerCase();
        const subheaderLower = table.subheaderText?.toLowerCase();
        const found = categories.find(({ categoryName }) => {
            const lower = categoryName.toLowerCase();
            return headerLower?.includes(lower) || subheaderLower?.includes(lower);
        })
        if (found) return found;
        const sectionLower = table.sectionText.toLowerCase();
        return categories.find(({ categoryName }) => {
            const lower = categoryName.toLowerCase();
            return sectionLower.includes(lower);
        });
    }




}

function getHealthNZTables($: CheerioAPI) {
    const { pathname } = new URL(HEALTH_GOVT_NZ_MINIMUM_PRODUCTS);

    const article = $(`article[about^="${pathname}"]`);
    const contentSelector = `[property="content:encoded"]`
    const $content = article.find(contentSelector);

    const tables: RemoteTableInfo[] = [];

    $content.find("h2").each(
        function (this: AnyNode) {
            const $h2 = $<AnyNode, "">(this);

            const $beforeH3 = $h2.nextUntil("h3");
            const $h3Previous = $beforeH3.length ? $beforeH3.last() : $h2;

            const sectionText = $h2.text();
            const sectionInfo = $beforeH3
                .filter("p")
                .toArray()
                .map(function (node) {
                    return $<AnyNode, "">(node).text();
                });

            let $h3 = $h3Previous

            while ($h3 = findNext($h3, "h3", "h2")) {
                const headerText = $h3.text();

                const $beforeH4 = $h3.nextUntil("h4");

                const headerInfo = $beforeH4
                    .filter("p")
                    .toArray()
                    .map(function (node) {
                        return $<AnyNode, "">(node).text();
                    })

                let $h4 = $<AnyNode, "">($beforeH4.length ? $beforeH4.last()[0] : $h3[0]);

                while ($h4 = findNext($h4, "h4", "h3")) {
                    ok($h4.is("h4"), "expected h4");
                    const subheaderText = $h4.text();

                    const tableParentSelector = ".table-responsive, table";
                    const $beforeTable = $h4.nextUntil(tableParentSelector);
                    const $tableParent = ($beforeTable.length ? $beforeTable : $h4).next(tableParentSelector);
                    const $table = $tableParent.is("table") ? $tableParent : $tableParent.find("table");
                    // console.log({ headerText, subheaderText })
                    ok($tableParent.length, "expected h4 to follow with .table-responsive");
                    ok($table.length, "expected table");

                    const subheaderInfo = $beforeTable
                        .filter("p")
                        .toArray()
                        .map(function (node) {
                            return $<AnyNode, "">(node).text();
                        })

                    tables.push({
                        sectionText,
                        sectionInfo,
                        headerText,
                        headerInfo,
                        subheaderText,
                        subheaderInfo,
                        $table,
                        rows: getTableRows($, $table)
                    });
                }
            }


        }
    );

    return tables;

    function findNext(element: Cheerio<AnyNode>, selector: AcceptedFilters<Element>, haltAt?: string): Cheerio<AnyNode> | undefined {
        const next = element[0]?.nextSibling;
        // console.log(next.length, next[0]?.tagName, next.text())
        if (!next) return undefined;
        const $next = $<AnyNode, "">(next);
        if ($next.is(selector)) return $next;
        if (haltAt && $next.is(haltAt)) return undefined;
        return findNext($next, selector, haltAt);
    }
}

function getTableRows($: CheerioAPI, $table: Cheerio<AnyNode>): TableRow[] {
    const headers = $table
        .find("thead tr:first-of-type th")
        .toArray()
        .map(function (node) {
            return $<AnyNode, "">(node).text().trim();
        });
    return $table
        .find("tbody tr")
        .toArray()
        .map(function (row) {
            const $row = $<AnyNode, "">(row);
            const columns = $row
                .find("td")
                .toArray()
                .map(function (node) {
                    const $node = $<AnyNode, "">(node);
                    $node.remove("a");
                    return $node.text().trim();
                });
            ok(columns.length <= headers.length);
            return Object.fromEntries(
                columns.map((value, index) => [
                    headers[index],
                    value
                ])
            );
        })
}