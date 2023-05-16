import React, {PropsWithChildren, useMemo} from "react";
import {Category, Product} from "../../../../client";
import {CalendarIcon, CategoryIcon, GlobeIcon, PrescriptionBottleIcon} from "../icons";
import {ActiveIngredient, useActiveIngredients} from "./utils";
import {SingleProductMetrics, useMetric} from "../../data";
import {ActiveIngredientMetrics} from "../../../../data";
import {isNumberString} from "../../../../calculations";

export interface ProductProps {
  product: Product;
  metrics?: SingleProductMetrics;
  category?: Category;
}

export interface PercentageLabelProps extends ActiveIngredient {

}

const PercentageLabel = React.memo(({ type, label, sortIndex }: PercentageLabelProps) => (
    <Label
        className={sortIndex === 0 ? "bg-green-400" : "bg-green-100"}
    >
      {label} {type}
    </Label>
));

interface LabelProps {
  className?: string;
}

const Label = React.memo(({ children, className }: PropsWithChildren<LabelProps>) => (
    <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full  text-green-800 bg-green-100 ${className}`}
    >
      {children}
    </span>
));

function trimNumber(value: string | number) {
    if (!isNumberString(value)) return value;
    return (+value).toFixed(2);
}

function toMetricLabel(metric: ActiveIngredientMetrics) {
    const { unit } = metric;
    let prefix,
        suffix = toMetricTypeName(unit);
    if (unit.includes("/")) {
        const [start, ...restSplit] = unit.split("/");
        const rest = restSplit.join("/");
        prefix = start;
        suffix = `per ${toMetricTypeName(rest)}`
    }
    return `${prefix}${trimNumber(metric.value)} ${suffix}`;
}

function toMetricTypeName(value: string): string {
    if (value.includes("/")) {
        return toMetricTypeName(value.split("/").at(-1));
    }
    if (value === "g") {
        return "gram";
    }
    return value;
}

export function ProductListItem({ product, category, metrics }: ProductProps) {
  const { productId, ...attributes } = product;
  const productUrl = `/calculator?productName=${encodeURIComponent(product.productName)}`;

  const ingredients = useActiveIngredients(product);
  const metric = useMetric(metrics, {
      unit: "$/g",
      type: "g",
      numeric: true
  });

  return (
    <li>
      <a href={productUrl} className="block hover:bg-gray-50">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-indigo-600 flex flex-row align-start">
                <span className="truncate">
                    {attributes?.productName}
                </span>
                {
                    metric ? (
                        <Label>
                            {toMetricLabel(metric)}
                        </Label>
                    ) : undefined
                }
            </p>
            <div className="ml-2 flex-shrink-0 flex">
              {
                ingredients.map((value, index) => (
                    <PercentageLabel key={index} {...value} />
                ))
              }
            </div>
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <div className="sm:flex">
              {
                category ? (
                    <p className="flex items-center text-sm text-gray-500">
                      <CategoryIcon categoryName={category.categoryName} />
                      {category.categoryName}
                    </p>
                ) : undefined
              }
            </div>
            {
              product.sizes?.length ? (
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <PrescriptionBottleIcon
                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                    />
                    <p>
                      Available in {product.sizes.map(({ value, unit }, index, array) => {
                      const isLast = index && array.length === (index + 1);
                      return `${isLast ? "& " : ""}${value}${unit}`
                    }).join(", ")}
                    </p>
                  </div>
              ) : undefined
            }
          </div>
        </div>
      </a>
    </li>
  );
}

export default React.memo(ProductListItem);
