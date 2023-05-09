import {ActiveIngredient, Product, ProductData} from "./types";
import {getProductStore} from "./store";

export async function setProduct(data: ProductData & Pick<Product, "productId"> & Partial<Product>): Promise<Product> {
    const store = await getProductStore();
    const updatedAt = new Date().toISOString();
    const document: Product = {
        createdAt: data.createdAt || updatedAt,
        ...data,
        activeIngredients: getActiveIngredients(),
        updatedAt
    };
    await store.set(data.productId, document);
    return document;

    function getActiveIngredients(): ActiveIngredient[] {
        const descriptions: string[] = data.activeIngredientDescriptions ?? []
        return descriptions.flatMap(getActiveIngredientsFromString);
    }

    function getActiveIngredientsFromString(string: string): ActiveIngredient[] {

        const percentageRegex = /([≤<]?\s*\d+(?:\.\d+)?\s*%)/;
        const unitRegex = /([≤<]?\s*\d+(?:\.\d+)?\s*[a-z]+\/[a-z]+)/i;

        const ingredients: ActiveIngredient[] = [];

        const percentageMatch = string.match(percentageRegex);
        const unitMatch = string.match(unitRegex);

        let type = string;

        if (/^Total\s+([A-Z]{3})\s/i.test(string)) {
            const split = string.split(/\s/g);
            // Total CBD, all currently published ingredients are like this
            type = split[1];
        }

        if (percentageMatch) {
            const match = percentageMatch[1]
                .replace(/%$/, "")
                .trim();

            ingredients.push({
                type,
                unit: "%",
                value: match
            });
        }

        if (unitMatch) {
            const [,unit] = unitMatch[1].match(/([a-z]+\/[a-z]+)/i);
            const withoutUnit = unitMatch[1].replace(unit, "").trim();

            ingredients.push({
                type,
                unit,
                value: withoutUnit
            });

        }

        return ingredients;
    }
}