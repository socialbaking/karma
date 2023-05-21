import { Product } from "./client";
import { ok } from "../is";

const NAME_SPLIT = " ";

export function getMatchingProducts(
  products: Product[],
  search: string,
  direct?: boolean
): Product[] {
  ok(typeof search === "string", "expected search to be a string");
  const exactMatch = products.filter(
    (product) => product.productName === search
  );
  if (exactMatch.length && direct) {
    return exactMatch;
  }
  const lower = search.toLowerCase();
  const lowerSplit = lower.split(NAME_SPLIT);
  let matching = products.filter((product) => {
    const lowerName = product.productName.toLowerCase();
    return lowerName.includes(lower);
  });
  // See if we can match a direct word but where its multiple words in the product name...
  if (!matching.length && !search.includes(" ")) {
    matching = products.filter((product) => {
      const lowerName = product.productName.split(" ").join("").toLowerCase();
      return lowerName.includes(lower);
    });
  }
  if (matching.length && direct) {
    return matching;
  }
  // Second search across for any other matches
  // Direct matches should be first
  matching = matching.concat(
    products.filter((product) => {
      if (matching.includes(product)) return;
      const lowerName = product.productName.toLowerCase();
      return lowerSplit.every((value) => lowerName.includes(value));
    })
  );
  if (!matching.length && !search.includes(" ")) {
    matching = products.filter((product) => {
      const lowerName = product.productName.split(" ").join("").toLowerCase();
      return lowerSplit.every((value) => lowerName.includes(value));
    });
  }
  if (!matching.length && !exactMatch.length && search.includes(" ")) {
    const searchSplit = search.split(" ");
    const [first, second, ...rest] = searchSplit;
    if (rest.length) {
      matching = getMatchingProducts(products, `${first} ${second}`, direct);
    }
    if (!matching.length) {
      // Last ditch effort
      const secondWord = getMatchingProducts(products, second, false);
      if (secondWord.length === 1) {
        matching = secondWord;
      } else {
        const firstWord = getMatchingProducts(
          secondWord.length ? secondWord : products,
          first,
          false
        );
        if (firstWord.length === 1) {
          matching = firstWord;
        } else {
          matching = secondWord;
        }
      }
      if (matching.length > 1 && rest.length) {
        const type = rest.find((value) => /^[A-Z]{3}\s*\d+$/.test(value));
        if (type) {
          const withoutSpace = type.replace(/\s/g, "");
          const initial = matching;
          matching = getMatchingProducts(initial, withoutSpace, false);
          if (!matching.length) {
            const typeNumber = withoutSpace.replace(/^[A-Z]{3}/, "").trim();
            const typeValue = type.replace(typeNumber, "").trim();
            const withSpace = `${typeValue} ${typeNumber}`;
            matching = getMatchingProducts(initial, withSpace, false);
          }
        }
      }
    }
    if (matching.length > 1) {
      matching = [];
    }
  }
  return [...new Set<Product>([...exactMatch, ...matching])];
}
