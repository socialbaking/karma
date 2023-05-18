import {ProductActiveIngredient, Product, ProductData} from "./types";
import {getProductStore} from "./store";
import {ok} from "../../../is";
import {toHumanNumberString} from "../../calculations";
import {isNumberString} from "../../calculations/is";

export const PRODUCT_PERCENTAGE_REGEX = /([≤<]?\s*\d+(?:\.\d+)?\s*%)/;
export const PRODUCT_UNIT_REGEX = /(?:^|\s|[\[(])([≤<]?\s*(?:\d+\.\d+|\d+)\s*[a-z]{1,2}(?:\s*\/\s*[a-z][A-Za-z]?[a-z]*)?)(?:\s|$|,|[\])])/g;

export async function setProduct(data: ProductData & Pick<Product, "productId"> & Partial<Product>): Promise<Product> {
    const store = await getProductStore();
    const updatedAt = new Date().toISOString();
    const document: Product = {
        createdAt: data.createdAt || updatedAt,
        ...data,
        activeIngredients: getActiveIngredients(data, data.activeIngredientDescriptions),
        updatedAt
    };
    await store.set(data.productId, document);
    return document;
}

export function getActiveIngredients(data: Partial<Product>, descriptions?: string[]): ProductActiveIngredient[] | undefined {
    if (!descriptions) return undefined;
    return descriptions.flatMap(value => getActiveIngredientsFromString(data, value));
}

function getActiveIngredientsFromString(data: Partial<Product>, string: string): ProductActiveIngredient[] {

    const ingredients: ProductActiveIngredient[] = [];

    const percentageMatch = string.match(PRODUCT_PERCENTAGE_REGEX);
    const unitMatches = string.matchAll(PRODUCT_UNIT_REGEX);

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

        const { value, prefix } = splitValuePrefix(match);
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

    if (unitMatches) {
        for (const [,unitMatch] of unitMatches) {

            const {
                unit,
                value,
                prefix
            } = splitValueUnitPrefix(unitMatch);

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


    }

    return ingredients;

}

export function splitValuePrefix(value: string) {
    // Remove any number
    const prefix = value.replace(/\d+(?:\.\d+)?$/, "").trim();
    return {
        prefix: prefix ? prefix : undefined,
        value: prefix ? value.replace(prefix, "").trim() : value
    };
}

export function splitValueUnitPrefix(value: string) {
    const [withoutUnit, ...unitParts] = value
        .replace(/[\[\]()]/g, "")
        .trim()
        .split(/\s+/)

    const unit = unitParts.join("");

    return {
        unit,
        ...splitValuePrefix(withoutUnit)
    }
}