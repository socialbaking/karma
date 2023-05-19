import { Product } from "../../../../client";
import { useMemo } from "react";
import { isNumberString } from "../../../../calculations";

export interface ActiveIngredientData {
  type: string;
  value: number;
  values: number[];
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
  const { unit } = sizes[0];
  // Prefer matching unit first
  let calculated = activeIngredients.filter(
    (value) =>
      value.calculated &&
      value.unit === unit &&
      isNumberString(value.value) &&
      value.size
  );
  if (!calculated.length) {
    calculated = activeIngredients.filter(
      (value) => value.calculated && isNumberString(value.value) && value.size
    );
  }
  const types = [...new Set(calculated.map((value) => value.type))];

  return (
    types
      .map((type): ActiveIngredientData => {
        const typeValues = calculated.filter((value) => value.type === type);
        const typeUnit = typeValues[0].unit;
        const unitValues = typeValues.filter(
          (value) => value.unit === typeUnit
        );
        const prefix = unitValues.find((value) => value.prefix)?.prefix;
        const values = [
          ...new Set(
            unitValues.map((value) => {
              const numeric = +value.value;
              if (prefix) return numeric;
              return Math.round(numeric * 10) / 10;
            })
          ),
        ].sort((a, b) => (a > b ? -1 : 1));
        const max = Math.max(...values);
        return {
          type: type,
          value: max,
          values,
          label: `${prefix || ""}${values.join("/")}${typeUnit}`,
        };
      })
      .sort(({ value: a }, { value: b }) => (a > b ? -1 : 1))
      .map((data, index) => ({
        ...data,
        sortIndex: index,
      }))
      // Sort alphabetically descending
      .sort(({ type: a }, { type: b }) => (a > b ? -1 : 1))
  );
}
