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
        const unitRegex = /([≤<]?\s*\d+(?:\.\d+)?\s*[a-z]+(?:\/[a-z]+)?)/i;

        const ingredients: ActiveIngredient[] = [];

        const percentageMatch = string.match(percentageRegex);
        const unitMatch = string.match(unitRegex);

        let type = string;

        if (/^Total\s+([A-Z]{3})\s/i.test(string)) {
            const split = string.split(/\s/g);
            // Total CBD, all currently published ingredients are like this
            type = split[1];
        }

        let calculated = false;

        if (percentageMatch) {
            const match = percentageMatch[1]
                .replace(/%$/, "")
                .trim();

            const { value, prefix } = splitPrefix(match);
            const unit = "%";
            ingredients.push({
                type,
                unit,
                value,
                prefix
            });

            if (data.sizes?.length) {
                const numeric = +value;
                const percentage = numeric / 100;

                for (const size of data.sizes) {

                    if (!isNumberString(size.value)) {
                        continue;
                    }

                    const numericSize = +size.value;

                    ingredients.push({
                        size,
                        type,
                        calculated: true,
                        unit: size.unit,
                        value: toHumanNumberString(percentage * numericSize),
                        prefix,
                        calculatedUnit: unit
                    })
                }
            }
        }

        if (unitMatch) {
            const [,unit] = unitMatch[1].match(/([a-z]+(?:\/[a-z]+)?)/i);
            const withoutUnit = unitMatch[1].replace(unit, "").trim();
            const { value, prefix } = splitPrefix(withoutUnit);

            ingredients.push({
                type,
                unit,
                value,
                prefix
            });

            if (data.sizes?.length) {

                const [calculatedUnit,basis] = unit.split("/")

                const numeric = +value;

                for (const size of data.sizes) {
                    if (!isNumberString(size.value)) {
                        continue;
                    }
                    // If no basis, we will directly use size * unit
                    if (basis && size.unit.toLowerCase() !== basis.toLowerCase()) {
                        continue;
                    }
                    const numericSize = +size.value;
                    ingredients.push({
                        type,
                        unit: calculatedUnit,
                        calculated: true,
                        calculatedUnit: unit,
                        value: toHumanNumberString(numeric * numericSize),
                        size,
                        prefix
                    });
                }

            }

        }

        return ingredients;

        function splitPrefix(value: string) {
            // Remove any number
            const prefix = value.replace(/\d+(?:\.\d+)?$/, "").trim();
            return {
                prefix: prefix ? prefix : undefined,
                value: prefix ? value.replace(prefix, "").trim() : value
            };
        }

    }
}


export function isNumberString(value: string): value is `${number}` {
    return (
        typeof value === "string" &&
        /^-?\d+(?:\.\d+)?$/.test(value)
    );
}

export function toHumanNumberString(value: number) {
    const string = value.toString();
    const split = string.split(".");
    if (split.length === 1) return string;
    if (split[1].length <= 2) return string;
    const rounded = Math.round(value * 10000) / 10000;
    return rounded.toString();
}