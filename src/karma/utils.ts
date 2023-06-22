import type {Product, Organisation, Category} from "./client";
import type FuzzySearchType from "fuzzy-search";

// Including these functions in file to allow it to be a portable module by itself
function isLike<T>(value: unknown): value is T {
  return !!value;
}

function ok(value: unknown, message?: string): asserts value;
function ok<T>(value: unknown, message?: string): asserts value is T;
function ok(value: unknown, message?: string): asserts value {
  if (!value) {
    throw new Error(message ?? "Expected value");
  }
}

const FuzzySearchModule: unknown = await import("fuzzy-search").catch(() => undefined);

const NAME_SPLIT = " ";

export const NZULM_SEARCH_TERM_ACRONYM: Record<string, string> = {
  tetrahydrocannabinol: "THC",
  cannabidiol: "CBD",
  cannabigerol: "CBG",
};

export const NZULM_TERM_ACRONYM: Record<string, string> = {
  ...NZULM_SEARCH_TERM_ACRONYM,
  purified: "P",
  "full spectrum": "FS",
  "broad spectrum": "BS",
  isolate: "P", // Some products use purified to mean isolate
};
export const NZULM_TERMS = Object.keys(NZULM_TERM_ACRONYM);

const TYPE_VALUE_REGEX = /(?:^|\s)(?:[A-Z]{3}\s*\d+|\d+\s*[A-Z]{3})(?:$|\s)/
const TYPE_REGEX = /(?:^|\s)[A-Z]{3}(?:$|\s)/

const NUMBER_NUMBER_REGEX = /(?:^|\s)\d+\/\d+(?:$|\s)/

export function getMatchingProducts<P extends Product>(
  products: P[],
  organisations: Organisation[],
  categories: Category[],
  search: string,
  direct?: boolean
): P[] {
  // console.log({ search });
  ok(typeof search === "string", "expected search to be a string");
  if (!search) return products;

  products = products.filter(product => !product.obsoleteAt);

  const exactMatch = products.filter(
    (product) => product.productName === search
  );
  if (exactMatch.length) {
    // console.log("Exact match", exactMatch);
    return exactMatch;
  }
  // console.log("Not exact match", search);

  let lower = search.toLowerCase();

  const organisation = organisations.find(
      organisation => {
        const found = organisation.associatedBrandingTerms?.find(
            term => lower.includes(term.toLowerCase())
        )
        if (found) return true;
        const lowerName = organisation.organisationName.toLowerCase();
        return lower.includes(lowerName);
      }
  )

  if (organisation) {
    const before = search;
    search = [organisation.organisationName, ...(organisation.associatedBrandingTerms ?? [])]
        .reduce(
            (search, term) => search.replace(new RegExp(term, "ig"), ""),
            search
        )
        .split(/\s+/)
        .filter(Boolean)
        .join(" ")
        .trim();

    products = products.filter(
        value => value.organisationId === organisation.organisationId
    );

    // console.log({ products, organisation, before, search });

    if (products.length === 1 || !search) {
      return products;
    }
  }

  const category = categories.find(
      category => {
        const found = category.associatedTerms?.find(
            term => lower.includes(term.toLowerCase())
        )
        if (found) return true;
        const lowerName = category.categoryName.toLowerCase();
        return lower.includes(lowerName);
      }
  );

  if (category) {
    const before = search;
    search = [category.categoryName, ...(category.associatedTerms ?? [])]
        .reduce(
            (search, term) => search.replace(new RegExp(term, "ig"), ""),
            search
        )
        .split(/\s+/)
        .filter(Boolean)
        .join(" ")
        .trim();

    products = products.filter(
        value => value.categoryId === category.categoryId
    );
    // console.log({ products, category, before, search });
    if (products.length === 1 || !search) {
      return products;
    }
  }

  const numberNumber = search
      .split(" ")
      .find((value) => NUMBER_NUMBER_REGEX.test(value));

  // Turn 10/10 into CBD10 THC10, which is then matched next step
  if (numberNumber) {
    const split = numberNumber.split("/");
    const {
      NUMBER_NUMBER_SPLIT_REPLACE
    } = process.env;
    const splitReplace = (NUMBER_NUMBER_SPLIT_REPLACE || "THC/CBD")
        .split("/")
        .map((value, index) => `${value}${split[index]}`)
    const replace = splitReplace.join(" ");
    search = search.replace(numberNumber, replace);
    if (organisation && category) {
      const matching = getMatchingProducts(products, organisations, categories, search);
      if (matching.length) {
        return matching;
      }
    }
  }

  const types = search
    .split(" ")
    .filter((value) => TYPE_VALUE_REGEX.test(value) || TYPE_REGEX.test(value));

  if (types.length) {
    for (const type of types) {
      const searchWithoutType = search
          .replace(type, "")
          .replace(/\s{2,}/g, " ")
          .trim();
      const matchingType = getMatchingType(products, search);
      if (matchingType.length) {
        search = searchWithoutType;
        products = matchingType;
        if (!search) {
          return products;
        }
      }
    }
  }

  if (products.length === 0) {
    return [];
  }

  lower = search.toLowerCase();

  const termRegexes = NZULM_TERMS.map(
      (term) => new RegExp(`(?:^|\s*)${term}(?:$|\s*)`, "i")
  );
  const termMatch = termRegexes.find((regex) => regex.test(search));

  if (termMatch) {
    const nextSearch = termRegexes.reduce(
        (search, regex, index) =>
            search.replace(regex, NZULM_TERM_ACRONYM[NZULM_TERMS[index]]),
        search
    );
    const withoutTerms = termRegexes.reduce(
        (search, regex) =>
            search.replace(regex, ""),
        search
    )
        .trim()
        .replace(/\s{2,}/, " ")
    if (nextSearch !== search) {
      const termMatch = getMatchingProducts(products, organisations, categories, nextSearch, direct);
      if (termMatch.length === 1) {
        return termMatch;
      } else if (termMatch.length) {
        products = termMatch;
        search = withoutTerms;
      } else if (!termMatch.length) {
        search = withoutTerms;
      }
    }
  }

  lower = search.toLowerCase();

  // console.log({ search, products })

  // By this point we have matched organisation, category, number/number, type, and terms
  // Mostly, this should be a match by this point. The rest is just now trying backup search methods
  // The very next number filter should be the next biggest matcher
  if (products.length <= 1) {
    return products;
  }

  lower = search.toLowerCase();
  let lowerSplit = lower.split(NAME_SPLIT).filter(Boolean);
  const numbers = lowerSplit.filter(value => /^\d+(?:\.\d+)?$/.test(value));

  if (numbers.length) {
    const entries = products.map((product, index) => {
      const count = numbers.filter(number => {
        if (new RegExp(`(?:^|\s)${number}(?:\s|$)`).test(product.productName)) {
          return true;
        }
        return !!product.activeIngredients?.find(
            value => value.value === number // By chance right...
        )
      }).length;
      return [index, count] as const
    });
    const max = entries.sort((a, b) => a[1] > b[1] ? -1 : 1)[0];
    if (max[1] > 0) {
      const matching = entries
          .filter(entry => entry[1] === max[1])
          .map(entry => products[entry[0]]);
      if (matching.length === 1) {
        return matching;
      }
      if (matching.length) {
        products = matching;
      }
    }
  }

  const lowerSplitMatching = products.filter((product) => {
    const lowerName = product.productName.toLowerCase();
    return lowerSplit.every(value => lowerName.includes(value));
  });

  if (lowerSplitMatching.length) {
    return lowerSplitMatching;
  } else if (!search.includes(" ")) {
    // See if we can match a direct word but where its multiple words in the product name...
    const joinedMatching = products.filter((product) => {
      const lowerName = product.productName.split(" ").join("").toLowerCase();
      return lowerSplit.every(value => lowerName.includes(value));
    });
    if (joinedMatching.length) {
      return joinedMatching;
    }
  }

  if (!search) {
    return products;
  }

  const genericMatch = products.filter(
      product => (
          product.genericSearchTerm?.toLowerCase().includes(lower) ||
          product.genericAcronym?.toLowerCase().includes(lower) ||
          product.genericCategoryNames?.find(
              name => name.toLowerCase().includes(lower)
          )
      )
  );

  if (genericMatch.length) {
    return genericMatch;
  }

  if (!isLike<{ default: typeof FuzzySearchType }>(FuzzySearchModule)) return [];
  const keys: (keyof Product & string)[] = [
    "productName",
    "genericCategoryNames",
    "genericAcronym",
    "genericSearchTerm"
  ]
  const searcher = new FuzzySearchModule.default(products, keys, {
    caseSensitive: false
  });
  return searcher.search(search);
}

function getMatchingType<P extends Product>(products: P[], search: string) {
  const split = search.split(" ");
  const typeValueMatch = split.find((value) => TYPE_VALUE_REGEX.test(value));
  if (typeValueMatch) {
    return getNumericTypeMatch(typeValueMatch);
  }
  const typeMatch = split.find((value) => TYPE_REGEX.test(value));
  if (typeMatch) {
    return getTypeMatch(typeMatch);
  }
  return products;

  function getTypeMatch(typeMatch: string) {
    return products.filter(product => {
      return !!product.activeIngredients?.find(
          value => value.type === typeMatch
      );
    });
  }

  function getNumericTypeMatch(typeValueMatch: string) {
    const typeNumber = typeValueMatch.replace(/^[A-Z]{3}/, "").trim();
    const type = typeValueMatch.replace(typeNumber, "").trim();
    return products.filter(product => {
      return !!product.activeIngredients?.find(
          value => value.value === typeNumber && value.type === type
      );
    });
  }
}