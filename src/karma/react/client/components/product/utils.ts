import { Product } from "../../../../client";
import { useMemo } from "react";
import { isNumberString } from "../../../../calculations";

export interface ActiveIngredientData {
  type: string;
  unit: string;
  value: number;
  values: number[];
  label: string;
  title?: string;
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
        const rawValues = [
          ...new Set(unitValues.map((value) => +value.value)),
        ].sort((a, b) => (a > b ? -1 : 1));
        const values = [
          ...new Set(
            rawValues.map((value) => {
              if (prefix) return value;
              return Math.round(value * 10) / 10;
            })
          ),
        ];
        const max = Math.max(...values);
        const label = getLabel(values);
        const title = getLabel(rawValues);
        return {
          type: type,
          unit: typeUnit,
          value: max,
          values,
          label,
          title: label !== title ? title : undefined,
        };

        function getLabel(values: number[]) {
          return `${prefix || ""}${values.join("/")}${typeUnit}`;
        }
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
