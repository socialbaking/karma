import {Product} from "../../../../client";
import {useMemo} from "react";
import {isNumberString} from "../../../../calculations";

export interface ActiveIngredientData {
    type: string;
    value: number;
    label: string;
}

export interface ActiveIngredient extends ActiveIngredientData {
    sortIndex: number;
}

export function useActiveIngredients(product: Product): ActiveIngredient[] {
    return useMemo(() => getActiveIngredients(product), [product]);
}

export function getActiveIngredients(product: Product): ActiveIngredient[] {
    const { sizes, activeIngredients } = product;
    if (!(sizes?.[0] && activeIngredients)) return [];
    const { unit } = sizes[0]
    const calculatedMatching = activeIngredients
        .filter(value => (
            value.calculated &&
            value.unit === unit &&
            isNumberString(value.value)
        ));
    return calculatedMatching
        .map(
            ({ type, value, unit }): ActiveIngredientData => ({
                type: type,
                value: +value,
                label: `${value} ${unit}`
            })
        )
        .sort(({ value: a }, { value: b }) => a > b ? -1 : 1)
        .map((data, index) => ({
            ...data,
            sortIndex: index
        }))
        // Sort alphabetically descending
        .sort(({ type: a }, { type: b }) => a > b ? -1 : 1);
}