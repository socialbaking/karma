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
    matching = matching.concat(
      products.filter((product) => {
        if (matching.includes(product)) return;
        const lowerName = product.productName.split(" ").join("").toLowerCase();
        return lowerSplit.every((value) => lowerName.includes(value));
      })
    );
  }
  return [...new Set<Product>([...exactMatch, ...matching])];
}
