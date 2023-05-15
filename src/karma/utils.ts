import {Product} from "./client";

const NAME_SPLIT = " ";

export function getMatchingProducts(products: Product[], search: string) {
    const lower = search.toLowerCase();
    const matching = products.filter(product => {
        const lowerName = product.productName.toLowerCase();
        return lowerName.includes(lower);
    });
    if (matching.length) {
        return matching;
    }
    const lowerSplit = lower.split(NAME_SPLIT);
    return products.filter(product => {
        const lowerName = product.productName.toLowerCase();
        return lowerSplit.every(value => lowerName.includes(value));
    });
}