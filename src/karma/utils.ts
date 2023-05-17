import {Product} from "./client";

const NAME_SPLIT = " ";

export function getMatchingProducts(products: Product[], search: string, direct?: boolean) {
    const exactMatch = products.filter(product => product.productName === search);
    if (exactMatch.length) {
        return exactMatch;
    }
    const lower = search.toLowerCase();
    const lowerSplit = lower.split(NAME_SPLIT);
    const matching = products.filter(product => {
        const lowerName = product.productName.toLowerCase();
        return lowerName.includes(lower);
    });
    if (matching.length || direct) {
        return matching;
    }
    // Second search across for any other matches
    // Direct matches should be first
    return matching.concat(
        products
            .filter(product => {
                if (matching.includes(product)) return;
                const lowerName = product.productName.toLowerCase();
                return lowerSplit.every(value => lowerName.includes(value));
            })
    );
}