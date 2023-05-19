import { packageIdentifier } from "../../../package";
import { HEALTH_GOVT_NZ_MINIMUM_PRODUCTS, SEARCH_NZULM } from "../../../static";
import {
  AcceptedFilters,
  AnyNode,
  Cheerio,
  CheerioAPI,
  load,
  Element,
  FilterFunction,
} from "cheerio";
import { ok } from "../../../../is";
import {
  seedCategories,
  categories,
  seedPartners,
  getOrganisation,
  namespace,
  updatedAt,
  createdAt,
  organisations,
  seedProducts,
} from "./static-initial";
import {
  ProductInfo,
  listProducts,
  Product,
  setProduct,
  ProductSizeData,
  PRODUCT_UNIT_REGEX,
  getProduct,
  getActiveIngredients,
} from "../../product";
import { v5 } from "uuid";
import { Category } from "../../category";

const USER_AGENT = `A Patient Collective, running ${packageIdentifier}`;
const HEADERS = {
  "User-Agent": USER_AGENT,
};

const NZULM_SEARCH_TERMS = [
  "tetrahydrocannabinol",
  "cannabidiol",
  "cannabigerol",
];

const NZULM_SEARCH_TERM_ACRONYM: Record<string, string> = {
  tetrahydrocannabinol: "THC",
  cannabidiol: "CBD",
  cannabigerol: "CBG",
};

const NZULM_TERM_ACRONYM: Record<string, string> = {
  ...NZULM_SEARCH_TERM_ACRONYM,
  purified: "P",
  "full spectrum": "FS",
  "broad spectrum": "BS",
};
const NZULM_TERMS = Object.keys(NZULM_TERM_ACRONYM);
const NZULM_TERM_ACRONYMS = Object.values(NZULM_TERM_ACRONYM);

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
  const response = await fetch(HEALTH_GOVT_NZ_MINIMUM_PRODUCTS, {
    headers: {
      ...HEADERS,
    },
  });
  const text = await response.text();
  const $ = load(text);

  // First apply the health nz products as a basis to search from
  await seedHealthNZProducts($);
  // Then let NZULM provide some detail
  await seedFromNZULM();
  // But ensure that health nz has provided the details directly
  // and over-writes any defaults that came from nzulm
  // but retains any new info found using the nzulm process
  await seedHealthNZProducts($);
}

type TableRow = Record<string, string>;

interface RemoteTableInfo {
  sectionText: string;
  sectionInfo?: string[];
  headerText?: string;
  headerInfo?: string[];
  subheaderText?: string;
  subheaderInfo?: string[];
  rows: TableRow[];
  $table?: Cheerio<AnyNode>;
}

async function seedHealthNZProducts($: CheerioAPI) {
  const tables = getHealthNZTables($);

  console.log(`Have ${tables.length} tables to process`);
  // console.log(tables);

  const productPromises = tables.flatMap((table: RemoteTableInfo, tableIndex: number, array) => {
    const category = findCategory(table);
    const categoryId = category?.categoryId;
    const rowsBefore = array.slice(0, tableIndex).reduce(
        (sum, table) => table.rows.length + sum,
        0
    );
    return table.rows.map(async (row, rowIndex): Promise<Product> => {
      const productName = row["Product Name"];
      const activeIngredients = row["Active Ingredients"];
      // const notes = row["Administration notes"];
      const licenceHolderName = row["Licence holder"];
      const licenceHolder = licenceHolderName
        ? getOrganisation(licenceHolderName)
        : undefined;
      const sponsorName = row["Sponsor"];
      const sponsor = sponsorName ? getOrganisation(sponsorName) : undefined;

      ok(productName);
      ok(activeIngredients);
      ok(licenceHolder || sponsor);

      const sizes = splitSizes();
      // console.log({ productName, sizes })

      const product: Product = {
        categoryId,
        productId: v5(productName, namespace),
        productName,
        createdAt,
        updatedAt,
        licenceCountryCode: licenceHolder?.countryCode,
        licencedOrganisationId: licenceHolder?.organisationId,
        licenceApprovalWebsite: HEALTH_GOVT_NZ_MINIMUM_PRODUCTS,
        activeIngredientDescriptions: splitDescriptions(),
        sizes,
        info: [
          ...Object.entries(row).map(
            ([title, text]): ProductInfo => ({
              title,
              text,
            })
          ),
        ],
        order: rowsBefore + rowIndex
      };

      return setProduct({
        ...(await getProduct(product.productId)),
        ...product,
      });

      function splitSizes(): ProductSizeData[] | undefined {
        const searchKey = "pack sizes";
        const packSizeKey = Object.keys(row).find((value) =>
          value.toLowerCase().startsWith(searchKey)
        );
        const value = row[packSizeKey];
        if (!packSizeKey) return getDefaultSizes();
        if (!value) return getDefaultSizes();
        const unit = getUnit();
        if (!unit) return getDefaultSizes();
        const valueSplit = value
          .split(/,\s*/g)
          .map((value) => value.replace(unit, "").trim())
          .filter(Boolean);
        if (!valueSplit.length) return getDefaultSizes();
        return valueSplit.map(
          (value): ProductSizeData => ({
            value,
            unit,
          })
        );
        function getUnit() {
          let withoutKey = packSizeKey.substring(searchKey.length).trim();
          if (!withoutKey.startsWith("(")) return undefined;
          withoutKey = withoutKey.substring(1);
          if (!withoutKey.endsWith(")")) return undefined;
          return withoutKey.substring(0, withoutKey.length - 1).trim();
        }
      }

      function getDefaultSizes() {
        return category?.defaultSizes;
      }

      function splitDescriptions() {
        if (!activeIngredients) return undefined;
        const split = activeIngredients
          .split("\n")
          .map((value) => value.trim())
          .filter(Boolean);
        // If we get a good split early, it's got good data
        if (split.length > 1) return split;
        // If we split at "Total", each item will be a total followed by some details
        // We should add total back to each value
        const totalSplitValue = "Total ";
        const totalSplit = activeIngredients
          .split(totalSplitValue)
          .map((value) => value.trim())
          .filter(Boolean)
          .map((value) => `${totalSplitValue}${value}`);
        // If its no different then its just one line anyway, but good to check
        // We should just use the original provided
        if (totalSplit.length <= 1) return split;
        return totalSplit;
      }
    });
  });

  const products = await Promise.all(productPromises);

  const order = new Set(products.map(product => product.order));

  ok(order.size === products.length, "Expected orders to be unique");

  // for (const product of products) {
  //     console.log(product.productName);
  //     console.log(product.activeIngredientDescriptions?.join("\n"));
  //     console.log(product.activeIngredients)
  // }
  return products;
}

function findCategory(table: Partial<RemoteTableInfo>) {
  return (
    find(table.subheaderText?.toLowerCase()) ??
    find(table.headerText?.toLowerCase()) ??
    find(table.sectionText.toLowerCase())
  );

  function find(value?: string): Category | undefined {
    if (!value) return undefined;
    const lower = value.toLowerCase();
    let found = categories.find(({ categoryName }) => {
      return lower.includes(categoryName.toLowerCase());
    });
    if (found) {
      return found;
    }
    return categories.find(({ associatedTerms }) => {
      if (!associatedTerms) return false;
      const termsLower = associatedTerms.map((value) => value.toLowerCase());
      return termsLower.find((term) => {
        return lower.includes(term);
      });
    });
  }
}

function getHealthNZTables($: CheerioAPI) {
  const { pathname } = new URL(HEALTH_GOVT_NZ_MINIMUM_PRODUCTS);

  const article = $(`article[about^="${pathname}"]`);
  const contentSelector = `[property="content:encoded"]`;
  const $content = article.find(contentSelector);

  const tables: RemoteTableInfo[] = [];

  $content.find("h2").each(function (this: AnyNode) {
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

    let $h3 = $h3Previous;

    while (($h3 = findNext($h3, "h3", "h2"))) {
      const headerText = $h3.text();

      const $beforeH4 = $h3.nextUntil("h4");

      const headerInfo = $beforeH4
        .filter("p")
        .toArray()
        .map(function (node) {
          return $<AnyNode, "">(node).text();
        });

      let $h4 = $<AnyNode, "">($beforeH4.length ? $beforeH4.last()[0] : $h3[0]);

      while (($h4 = findNext($h4, "h4", "h3"))) {
        ok($h4.is("h4"), "expected h4");
        const subheaderText = $h4.text();

        const tableParentSelector = ".table-responsive, table";
        const $beforeTable = $h4.nextUntil(tableParentSelector);
        const $tableParent = ($beforeTable.length ? $beforeTable : $h4).next(
          tableParentSelector
        );
        const $table = $tableParent.is("table")
          ? $tableParent
          : $tableParent.find("table");
        // console.log({ headerText, subheaderText })
        ok($tableParent.length, "expected h4 to follow with .table-responsive");
        ok($table.length, "expected table");

        const subheaderInfo = $beforeTable
          .filter("p")
          .toArray()
          .map(function (node) {
            return $<AnyNode, "">(node).text();
          });

        tables.push({
          sectionText,
          sectionInfo,
          headerText,
          headerInfo,
          subheaderText,
          subheaderInfo,
          $table,
          rows: getTableRows($, $table),
        });
      }
    }
  });

  return tables;

  function findNext(
    element: Cheerio<AnyNode>,
    selector: AcceptedFilters<Element>,
    haltAt?: string
  ): Cheerio<AnyNode> | undefined {
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
        columns.map((value, index) => [headers[index], value])
      );
    });
}

async function seedFromNZULM() {
  interface GenericLink {
    text: string;
    url: string;
  }

  interface RowInformation {
    title: string;
    headerText: string;
    termText: string;
    flags: string[];
    subsidies: ProductInfo[];
  }

  const genericLinkPromises = NZULM_SEARCH_TERMS.map(getGenericLinks);
  const genericLinks = (await Promise.all<GenericLink[]>(genericLinkPromises))
    .flatMap<GenericLink>((values) => values)
    .filter((value, index, array) => {
      const before = array.slice(0, index);
      return !before.find((other) => other.url === value.url);
    });

  console.log(`${genericLinks.length} generic links to process`);
  console.log(...genericLinks);

  const rows = (await getSeedInformation())
    .sort((a, b) => {
      const aTerms = a.title.split(/\s?\+\s?/g);
      const bTerms = b.title.split(/\s?\+\s?/g);
      if (a.termText === b.termText) {
        return aTerms.length > bTerms.length ? -1 : 1;
      }
      if (aTerms.length !== bTerms.length) {
        return aTerms.length > bTerms.length ? -1 : 1;
      }
      return a.termText < b.termText ? -1 : 1;
    })
    .filter((value, index, array) => {
      const before = array.slice(0, index);
      return !before.find((other) => other.termText === value.termText);
    });

  const existingProducts = await listProducts();

  let products = await Promise.all(
    rows.map(async (row) => {
      const category = findCategory({
        sectionText: row.title,
        headerText: row.headerText,
        subheaderText: row.termText,
      });
      const categoryId = category?.categoryId;

      const terms = row.title
        .split(/\s?\+\s?/g)
        .map((value) => value.trim())
        .filter((value) => !!NZULM_SEARCH_TERMS.includes(value));
      const acronyms = terms
        .map((value) => NZULM_SEARCH_TERM_ACRONYM[value])
        .filter(Boolean);

      let [productName, ...rest] = row.termText
        .split(new RegExp(`\\s${row.headerText}(?:[\\s,]|$)`))
        .filter((value) => value)
        .map((value) => {
          value = value.trim();
          if (value.startsWith(",")) {
            value = value.substring(1).trim();
          }
          return value;
        });

      ok(rest.length <= 1);
      const [restText = ""] = rest;
      const restSplit = restText
        .split(/,\s*/)
        .map((value) => value.trim())
        .filter(Boolean);

      const organisation = findOrganisation();
      // const organisationProducts: Product[] = organisation ? (
      //     existingProducts.filter(product => product.organisationId === organisation.organisationId)
      // ) : [];

      const licencedProducts = organisation
        ? existingProducts.filter(
            (value) =>
              value.licencedOrganisationId === organisation.organisationId
          )
        : [];

      function alphaNumericOnly(value: string) {
        // If it's a multi-word term, easy to replace
        if (row.headerText?.includes(" ")) {
          value = value.replace(new RegExp(row.headerText, "ig"), "");
        }
        // If it's a multi-word term, easy to replace
        if (category?.categoryName.includes(" ")) {
          value = value.replace(new RegExp(category.categoryName, "ig"), "");
        }
        if (organisation) {
          value = value.replace(
            new RegExp(organisation.organisationName, "ig"),
            ""
          );
          value =
            organisation.associatedBrandingTerms?.reduce(
              (value, term) => value.replace(new RegExp(term, "ig"), ""),
              value
            ) ?? value;
        }
        for (const term of NZULM_TERMS) {
          value = value.replace(
            new RegExp(term, "ig"),
            NZULM_TERM_ACRONYM[term]
          );
        }
        return (
          value
            .replace(/[^\sa-z0-9]/gi, "")
            // Splitting up TYP000TYP000
            // Add space around the value by default, as we will remove this all in the next step
            // to keep all spacing consistent
            // nzulm listings aren't spacing consistent anyway
            .replace(/([A-Z]{3})(\d+)/g, " $1 $2 ")
            .split(/\s/g)
            .map((value) => value.trim())
            .filter(Boolean)
            .join(" ")
        );
      }

      const isObsolete = row.flags.includes("obsolete");

      const activeIngredientDescriptions = parseActiveIngredientDescriptions();
      const sizes = getSizes();
      const activeIngredients = getActiveIngredients(
        { sizes },
        activeIngredientDescriptions
      );

      let productNameSearch = alphaNumericOnly(productName);
      let licencedProduct: Product | undefined;

      {
        const lowerProductName = productName.toLowerCase();
        licencedProduct = licencedProducts.find((product) => {
          const lower = product.productName.toLowerCase();
          return lowerProductName.includes(lower);
        });
      }

      if (!licencedProduct) {
        licencedProduct = licencedProducts.find((licencedProduct) => {
          const nameAlpha = alphaNumericOnly(licencedProduct.productName);
          // Easy path
          return productNameSearch.startsWith(nameAlpha);
        });
      }

      if (organisation && !licencedProduct && category) {
        if (category.associatedTerms) {
          for (const term of category.associatedTerms) {
            // Match only the term by itself
            // the terms are sometimes used as part of a branded name
            const lowerTerm = ` ${term.toLowerCase()} `;
            const lowerProduct = productNameSearch.toLowerCase();
            if (!lowerProduct.includes(lowerTerm)) continue;
            const index = lowerProduct.indexOf(lowerTerm);
            const before = productNameSearch.slice(0, index);
            const after = productNameSearch.slice(index + lowerTerm.length);
            productNameSearch = [before, after]
              .map((value) => value?.trim())
              .filter(Boolean)
              .join(" ");
          }
        }
        productNameSearch = alphaNumericOnly(productNameSearch);
        licencedProduct = licencedProducts.find((licencedProduct) => {
          const nameAlpha = alphaNumericOnly(
            licencedProduct.productName
          ).toLowerCase();
          return productNameSearch.toLowerCase().startsWith(nameAlpha);
        });
        if (!licencedProduct && !isObsolete) {
          console.log("No licenced product, but branded", {
            productName,
            productNameSearch,
            category,
          });
        }
      }

      if (licencedProduct) {
        // console.log({ productName, licencedProduct });
        productName = licencedProduct.productName;
      }

      const product: Product = {
        categoryId,
        productId: v5(productName, namespace),
        productName,
        createdAt,
        updatedAt,
        licenceApprovalWebsite: SEARCH_NZULM,
        sizes,
        activeIngredientDescriptions,
        ...licencedProduct,
        generic: row.flags.includes("generic"),
        branded: row.flags.includes("branded"),
        organisationId: organisation?.organisationId,
        genericSearchTerm: row.title,
        genericAcronym: NZULM_SEARCH_TERM_ACRONYM[row.title],
        genericCategoryNames: [row.headerText],
        info: [...row.subsidies],
      };

      ok(product.generic || product.branded);

      if (isObsolete) {
        const existing = existingProducts.find(
          (value) => value.productId === product.productId
        );
        product.obsoleteAt = existing?.obsoleteAt ?? new Date().toISOString();
      }

      // console.log({
      //     productName,
      //     restSplit,
      //     categoryName: category?.categoryName,
      //     organisationName: organisation?.organisationName,
      //     existing: !!existing,
      //     ...row
      // });
      // console.log({
      //     productName,
      //     activeIngredients: product.activeIngredientDescriptions,
      //     terms
      // })

      // if (existing) {
      //     // If its existing and it's not flagged as deleted, leave it
      //     if (!isObsolete) return undefined;
      //     if (existing.obsoleteAt) return undefined;
      //     return {
      //         ...existing,
      //         obsoleteAt: new Date().toISOString()
      //     }
      // }

      return product;

      function getSizes() {
        const sizes = restSplit.filter((value) =>
          /^\d+\s[a-z][A-Z]?[a-z]*$/.test(value)
        );
        if (!sizes.length) return getDefaultSizes();
        return sizes.map((size) => {
          const [value, unit] = size.split(/\s/);
          return { value, unit };
        });
      }

      function getDefaultSizes() {
        return category?.defaultSizes;
      }

      function parseActiveIngredientDescriptions(): string[] {
        // Some Name THC 255 mg/g + CBD 10 mg/g dried flower
        // Some Name 180 mg/g + CBD 10 mg/g dried herb
        // Some Name 180 mg/g + CBD 10 mg/g dried herb

        // const percentageRegex = /([≤<]?\s*\d+(?:\.\d+)?\s*%)/;
        // const unitRegex = /(?:^|\s|[\[(])([≤<]?\s*\d+(?:\.\d+)?\s*[a-z]+(?:\s*\/\s*[a-z]+)?)/ig;
        const workingName = productName
          .split(":")
          .join(" ")
          // Split any acronyms from type
          .replace(/\s([A-Z]{3})(\d+)/g, "$1 $2");

        const termIngredients = terms
          .map((term) => {
            const termRegex = new RegExp(
              `${term}${PRODUCT_UNIT_REGEX.source}`,
              "i"
            );
            const match = workingName.match(termRegex);
            if (!match) return undefined;
            return `Total ${NZULM_SEARCH_TERM_ACRONYM[term]} ${replaceUnit(
              match[1]
            )}`;
          })
          .filter(Boolean);

        if (termIngredients.length === terms.length) {
          return termIngredients;
        }

        const titleContainsSizedUnit = workingName.includes("/");

        const acronymIngredients = acronyms
          .map((acronym) => {
            const acronymRegex = new RegExp(
              `${acronym}${PRODUCT_UNIT_REGEX.source}`,
              "i"
            );
            const match = workingName.match(acronymRegex);
            if (!match) return undefined;
            return `Total ${acronym} ${replaceUnit(match[1])}`;
          })
          .filter(Boolean);

        const foundSizedUnit = acronymIngredients.find((value) =>
          value.includes("/")
        );

        if (
          acronymIngredients.length === terms.length &&
          (!titleContainsSizedUnit || foundSizedUnit)
        ) {
          // console.log(productName, acronymIngredients)
          return acronymIngredients;
        }

        const unitMatches = [...workingName.matchAll(PRODUCT_UNIT_REGEX)].map(
          (match) => {
            return match[1];
          }
        );

        if (terms.length === 1 && unitMatches.length === 1) {
          return [
            `Total ${NZULM_SEARCH_TERM_ACRONYM[terms[0]]} ${replaceUnit(
              unitMatches[0]
            )}`,
          ];
        }

        const types = terms.map((term) => NZULM_SEARCH_TERM_ACRONYM[term]);

        if (terms.length === 2 && unitMatches.length === 2) {
          const found = types
            .map((type) => {
              return unitMatches
                .map((match) => {
                  const value = `${type} ${match}`;
                  if (!workingName.includes(value)) return undefined;
                  return { value, type, match };
                })
                .find(Boolean);
            })
            .find(Boolean);
          if (found) {
            const { value, type } = found;
            const otherType = types.filter((other) => other !== type);
            const otherValue = unitMatches.find((other) => other !== value);
            ok(otherType);
            ok(otherValue);
            return [
              `Total ${type} ${replaceUnit(value)}`,
              `Total ${otherType} ${replaceUnit(otherValue)}`,
            ];
          }
        }

        const typeMatches = types
          .map((type) => {
            const regex = new RegExp(`${type}\\s*(\\d+(?:\\.\\d+)?)`);
            const match = workingName.match(regex);
            if (!match) return undefined;
            return `Total ${type} ${match[1]} ${getDefaultUnit()}`.trim();
          })
          .filter(Boolean);

        // Allow to not match all, this is last ditch effort
        if (typeMatches.length) {
          return typeMatches;
        }

        return [];

        function replaceUnit(value: string) {
          if (value.includes("/")) return value;
          if (
            value.endsWith(" mg") &&
            category?.categoryName.toLowerCase() === "liquid"
          ) {
            return `${value}/mL`; // All liquids in NZ are measured in mL
          }
          if (value.endsWith(" mg") && !row.headerText.includes(" ")) {
            return `${value}/${row.headerText}`;
          }
          // TODO if not liquid but say, lozenge, it should be per unit type found
          return value;
        }

        function getDefaultUnit() {
          if (!category) return "";
          if (category.defaultUnit) {
            return category.defaultUnit;
          }
          const lower = category.categoryName.toLowerCase();
          if (lower === "flower") return "g";
          if (lower === "liquid") return "mg/mL";
          return "";
        }
      }

      function findOrganisation() {
        // Only the firstWord is usually associated with the brand
        // in nzulm
        const [firstWord] = productName.split(" ");
        const lowerFirstWord = firstWord.toLowerCase();

        return organisations.find((organisation) => {
          if (
            organisation.organisationName.toLowerCase().includes(lowerFirstWord)
          ) {
            return true;
          }
          return !!organisation.associatedBrandingTerms?.find((term) =>
            term.toLowerCase().includes(lowerFirstWord)
          );
        });
      }
    })
  );

  products = products.filter(Boolean);

  const duplicates = new Set<string>(
    products
      .map((value) => value.productName)
      .filter((value, index, array) => {
        const before = array.slice(0, index);
        return before.find((other) => other === value);
      })
  );

  if (duplicates.size) {
    // Generally if there are duplicates, it's because there are multiple categories for the same product name
    for (const duplicateName of duplicates) {
      const duplicateProducts = products.filter(
        (value) => value.productName === duplicateName
      );
      const product: Product = {
        ...duplicateProducts[0],
        genericCategoryNames: [
          ...new Set<string>(
            duplicateProducts.flatMap<string>(
              (product) => product.genericCategoryNames
            )
          ),
        ],
        activeIngredientDescriptions: [
          ...new Set<string>(
            duplicateProducts.flatMap<string>(
              (product) => product.activeIngredientDescriptions
            )
          ),
        ],
        // Using set here will remove the default category size duplicates if we are using them
        // ...hopefully
        sizes: [
          ...new Set(
            duplicateProducts.flatMap<ProductSizeData>(
              (product) => product.sizes ?? []
            )
          ),
        ],
      };

      const categoriesMatching = duplicateProducts.every(
        (value) => value.categoryId === product.categoryId
      );

      ok(categoriesMatching);

      const brandGenericMatching = duplicateProducts.every(
        (value) =>
          value.branded === product.branded && value.generic === product.generic
      );

      ok(brandGenericMatching);

      products = products.filter((value) => !duplicateProducts.includes(value));
      products.push(product);
    }

    const afterDuplicates = new Set<string>(
      products
        .map((value) => value.productName)
        .filter((value, index, array) => {
          const before = array.slice(0, index);
          return before.find((other) => other === value);
        })
    );

    ok(afterDuplicates.size === 0);
  }

  console.log(products.length);

  for (const product of products) {
    const out = await setProduct({
      ...(await getProduct(product.productId)),
      ...product,
    });
    // console.log(out.productName, out.activeIngredientDescriptions, out.activeIngredients)
  }

  async function getSeedInformation() {
    const rows: RowInformation[] = [];
    for (const { text: genericText, url } of genericLinks) {
      console.log(`Getting seed information for ${genericText}`);
      const response = await fetch(new URL(url, SEARCH_NZULM), {
        headers: {
          ...HEADERS,
        },
      });
      const text = await response.text();
      const $ = load(text);

      const $results = $<AnyNode, "">("#search_results_area");

      const $headers = $results.children(
        ".row.search_results_subheader_wrapper:not(:first-child)"
      );

      const rowInfo = $headers.toArray().flatMap((header) => {
        const $header = $<AnyNode, "">(header);
        const headerText = $header.text().trim();
        const $rows = $header.nextUntil(".search_results_subheader_wrapper");
        return $rows.toArray().flatMap<RowInformation>((row) => {
          const $row = $<AnyNode, "">(row);
          const $term = $row.find(".search_result_cell");
          if (!$term.length) return [];
          ok($term.length, "expected .search_result_cell");
          let termText = $term.text().trim();
          const subsidies = $row
            .find(".subsidy_cell [title]")
            .toArray()
            .map(function (node): ProductInfo {
              const $node = $<AnyNode, "">(node);
              const text = $node.text().trim();
              const title = $node
                .attr("title")
                .replace("See details below.", "")
                .trim();
              if (text.length < title.length) {
                // :)
                return { text: title, title: text };
              }
              return { text, title };
            });

          const flags = new Set<string>();

          for (const [replace, match] of termText.matchAll(/\[([^\]]+)]/g)) {
            termText = termText.replaceAll(replace, "");
            flags.add(match.replace("[", "").replace("]", "").toLowerCase());
          }

          if ($term.find(".search_results_generic_item").length) {
            flags.add("generic");
          }
          if ($term.find(".search_results_brand_item").length) {
            flags.add("branded");
          }
          return {
            title: genericText,
            termText,
            headerText,
            subsidies,
            flags: [...flags].filter(Boolean),
          };
        });
      });

      rows.push(...rowInfo);
    }
    return rows;
  }

  async function getGenericLinks(criteria: string) {
    const url = new URL("/search/for", SEARCH_NZULM);
    url.searchParams.set("search_mode", "ALL");
    url.searchParams.set("criteria", criteria);
    const response = await fetch(url, {
      headers: {
        ...HEADERS,
      },
    });
    const text = await response.text();
    const $ = load(text);

    const $lists = $<AnyNode, "">(".search_results_list");

    const $genericList = $lists.filter(function (this: Element) {
      const $this = $<AnyNode, "">(this);
      return !!$this
        .find(".search_results_subheader")
        .text()
        .includes("Generic");
    });

    if (!$genericList.length) return [];

    const $links = $genericList.find(".row a[href]");

    return $links.toArray().map((link): GenericLink => {
      const $link = $<AnyNode, "">(link);
      return {
        text: $link.text(),
        url: $link.attr("href"),
      };
    });
  }
}
