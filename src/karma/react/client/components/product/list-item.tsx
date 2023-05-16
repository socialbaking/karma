import React, {PropsWithChildren, useMemo} from "react";
import {Category, Product} from "../../../../client";
import {CalendarIcon, CategoryIcon, GlobeIcon, PrescriptionBottleIcon} from "../icons";
import {ActiveIngredient, useActiveIngredients} from "./utils";
import {SingleProductMetrics, useMetrics, useMetricMatch} from "../../data";
import {ActiveIngredientMetrics} from "../../../../data";
import {isNumberString} from "../../../../calculations";

export interface ProductProps {
  product: Product;
  metrics?: SingleProductMetrics;
  report?: boolean;
  category?: Category;
}

export interface ProductItemProps extends ProductProps {
    className?: string;
    overrideClassName?: string;
}

export interface PercentageLabelProps extends ActiveIngredient {
    className?: string
}

const PercentageLabel = React.memo(({ type, label, sortIndex, className }: PercentageLabelProps) => (
    <Label
        className={`${sortIndex === 0 ? "bg-green-400" : "bg-green-100"} ${className || ""}`}
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
    const { unit, type } = metric;
    let prefix,
        suffix = toMetricTypeName(unit);
    let valueUnit = unit;
    if (unit.includes("/")) {
        const [start, ...restSplit] = unit.split("/");
        const rest = restSplit.join("/");
        valueUnit = rest;
        prefix = start;
        suffix = `per ${toMetricTypeName(rest)}`
    }
    if (valueUnit !== type) {
        suffix = `${suffix} of ${type}`;
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

export function ProductListItem({ product, category, metrics: allMetrics, report: isReporting, overrideClassName, className }: ProductItemProps) {
  const { productId, sizes, ...attributes } = product;
  const productUrl = `/calculator?productName=${encodeURIComponent(product.productName)}`;

  const ingredients = useActiveIngredients(product);
  const sizeUnit = sizes?.[0]?.unit;
  const unit = sizeUnit || "g";
  const metrics = useMetrics(allMetrics, {
      unit: `$/${unit}`
  });
  const unitMetric = useMetricMatch(metrics, {
      type: unit,
      numeric: true
  });

  return (
    <li>
      <a href={productUrl} className={overrideClassName ?? `block hover:bg-gray-50 px-4 py-4 sm:px-6 ${className || ""}`}>
          <div className="flex justify-between flex-wrap">
            <div className={`text-sm font-medium text-indigo-600 flex flex-wrap mb-4 ${isReporting ? "flex-col" : "flex-row align-start"}`}>
                <div className="truncate mr-1">
                    {attributes?.productName}
                </div>
                <div className="flex flex-col">
                    {
                        isReporting ? (
                            metrics
                                .filter(value => !value.proportional)
                                .map(
                                    (metric, index) => (
                                        <Label key={index} className="mt-1">
                                            {toMetricLabel(metric)}
                                        </Label>
                                    )
                                )
                        ) : (
                            unitMetric ? (
                                <Label>
                                    {toMetricLabel(unitMetric)}
                                </Label>
                            ) : undefined
                        )
                    }
                </div>
            </div>
            <div className="ml-2 flex-shrink-0 flex flex-col align-start justify-between mb-4">
              <div className="flex flex-row">
                  {
                      ingredients.map((value, index) => (
                          <PercentageLabel key={index} {...value} className="ml-1" />
                      ))
                  }
              </div>
              {
                    product.sizes?.length ? (
                        <div className="flex items-center text-sm text-gray-500 justify-end flex-row mt-2">
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
          </div>
      </a>
    </li>
  );
}

export default React.memo(ProductListItem);
