import React, { PropsWithChildren, useMemo } from "react";
import { Category, Product } from "../../../../client";
import {
  CalendarIcon,
  CategoryIcon,
  GlobeIcon,
  PrescriptionBottleIcon,
} from "../icons";
import { ActiveIngredient, useActiveIngredients } from "./utils";
import { SingleProductMetrics, useMetrics, useMetricMatch } from "../../data";
import { ActiveIngredientMetrics } from "../../../../data";
import { isNumberString } from "../../../../calculations";

export interface ProductProps {
  product: Product;
  metrics?: SingleProductMetrics;
  report?: boolean;
  category?: Category;
}

export interface ProductItemProps extends ProductProps {
  className?: string;
  overrideClassName?: string;
  url?: string; // search path for product
  isAnonymous?: boolean
}

export interface PercentageLabelProps extends ActiveIngredient {
  className?: string;
}

const PercentageLabel = React.memo(
  ({ type, label, sortIndex, className, title }: PercentageLabelProps) => (
    <Label
      className={`px-2 leading-5 text-green-800 ${
        sortIndex === 0 ? "bg-green-400" : "bg-green-100"
      } ${className || ""}`}
      title={title}
    >
      {label} {type}
    </Label>
  )
);

interface LabelProps {
  className?: string;
  title?: string;
}

const Label = React.memo(
  ({ children, className, title }: PropsWithChildren<LabelProps>) => (
    <span
      className={`inline-flex text-xs font-semibold rounded-full ${className}`}
      title={title}
    >
      {children}
    </span>
  )
);

function trimNumber(value: string | number) {
  if (!isNumberString(value)) return value;
  return (+value).toFixed(2);
}

function toMetricLabel(metric: ActiveIngredientMetrics, rounded = true) {
  const { unit, type } = metric;
  let prefix,
    suffix = toMetricTypeName(unit);
  let valueUnit = unit;
  if (unit.includes("/")) {
    const [start, ...restSplit] = unit.split("/");
    const rest = restSplit.join("/");
    valueUnit = rest;
    prefix = start;
    suffix = `per ${toMetricTypeName(rest)}`;
  }
  if (valueUnit !== type) {
    suffix = `${suffix} of ${type}`;
  }
  return `${prefix}${
    rounded ? trimNumber(metric.value) : metric.value
  } ${suffix}`;
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

export function ProductListItem({
  product,
  category,
  metrics: allMetrics,
  report: isReporting,
  overrideClassName,
  className,
  url,
  isAnonymous,
}: ProductItemProps) {
  const { productId, sizes, ...attributes } = product;
  const productUrl = `${url || "calculator"}?search=${encodeURIComponent(
    product.productName
  )}`;

  const ingredients = useActiveIngredients(product);
  const sizeUnit = sizes?.[0]?.unit || "g";
  const unit = (category?.defaultUnit || sizeUnit || "g").split("/")[0];
  const ingredientUnit =
    ingredients.find(
      (value) => value.unit && value.unit !== unit && value.unit !== sizeUnit
    )?.unit || unit;
  const baseUnitMetrics = useMetrics(allMetrics, {
    unit: `$/${unit}`,
    numeric: true,
  }).filter((value) => !value.proportional);
  const baseSizeMetrics = useMetrics(allMetrics, {
    unit: `$/${sizeUnit}`,
    numeric: true,
  }).filter((value) => !value.proportional);
  const baseIngredientMetrics = useMetrics(allMetrics, {
    unit: `$/${ingredientUnit}`,
    numeric: true,
  }).filter((value) => !value.proportional);
  const numericUnitMetric = useMetricMatch(baseUnitMetrics);
  const numericSizeMetric = useMetricMatch(baseSizeMetrics);
  const metrics = [
    ...new Set(
      isReporting
        ? [...baseUnitMetrics, ...baseSizeMetrics]
        : [
            numericUnitMetric,
            numericSizeMetric,
            ...baseIngredientMetrics,
          ].filter(Boolean)
    ),
  ];
  // console.log({
  //   baseIngredientMetrics,
  //   ingredientUnit,
  //   metrics
  // })
  return (
    <li>
      <a
        href={productUrl}
        className={
          overrideClassName ??
          `block hover:bg-gray-50 sm:px-4 py-4 sm:px-6 ${className || ""}`
        }
      >
        <div className="flex justify-between flex-wrap flex-col sm:flex-row">
          <div
            className={`text-sm font-medium text-indigo-600 flex flex-wrap mb-4 flex-col flex-1`}
          >
            <div className="flex flex-wrap mr-1">{attributes?.productName}</div>
            <div className="flex flex-col">
              {/*{isReporting || unitMetric ? (*/}
              {/*  <Label className="mt-1 px-4 leading-5 text-red-800 bg-red-100">*/}
              {/*    This software is in beta*/}
              {/*    <br />*/}
              {/*    It may produce inaccurate data or results*/}
              {/*  </Label>*/}
              {/*) : undefined}*/}
              {[...new Set(metrics.filter((value) => !value.proportional))]
                .map((metric, index) => {
                  const label = toMetricLabel(metric, !isReporting);
                  const node = (
                    <Label
                      key={index}
                      className={
                        isReporting
                          ? "mt-1 px-2 leading-5 text-green-800 bg-green-100"
                          : "mt-1 text-gray-400"
                      }
                      title={toMetricLabel(metric, false)}
                    >
                      {label}
                    </Label>
                  );
                  if (isReporting) return [label, node] as const;
                  return [
                    label,
                    <div className="block" key={index}>
                      {node}
                    </div>,
                  ] as const;
                })
                // Filter duplicate visual labels
                .filter((entry, index, array) => {
                  const [label] = entry;
                  const before = array.slice(0, index);
                  return !before.find((entry) => entry[0] === label);
                })
                .map((entry) => entry[1])}
              {product.generic ? (
                <div className="block">
                  <Label className="mt-1 text-gray-400">
                    Generic {product.genericCategoryNames?.join(", ")}
                  </Label>
                </div>
              ) : product.branded ? (
                <div className="block">
                  <Label className="mt-1 text-gray-400">
                    Branded {product.genericCategoryNames?.join(", ")}
                  </Label>
                </div>
              ) : product.genericCategoryNames?.length ? (
                <div className="block">
                  <Label className="mt-1 text-gray-400">
                    {product.genericCategoryNames?.join(", ")}
                  </Label>
                </div>
              ) : undefined}
            </div>
            {category ? (
              <p className="flex items-center text-sm text-gray-500 mt-8">
                <CategoryIcon categoryName={category.categoryName} />
                {category.categoryName}
              </p>
            ) : undefined}
          </div>
          <div className="sm:ml-2 flex-1 flex flex-col-reverse sm:flex-col align-start justify-between mb-4">
            <div className="flex justify-start sm:justify-end flex-row pt-4 sm:pt-0">
              {ingredients.map((value, index) => (
                <PercentageLabel key={index} {...value} className="ml-1" />
              ))}
            </div>
            {product.sizes?.length ? (
              <div className="flex items-center text-sm text-gray-500 justify-start sm:justify-end flex-row sm:mt-2">
                <PrescriptionBottleIcon
                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
                <p>
                  {(product.generic || isAnonymous) ? "Typically available" : "Available"} in{" "}
                  {[...product.sizes]
                    .sort((a, b) => {
                      if (a.unit !== b.unit) {
                        return a.unit < b.unit ? -1 : 1;
                      }
                      return a.value > b.value ? -1 : 1;
                    })
                    .map(({ value, unit }, index, array) => {
                      const isLast = index && array.length === index + 1;
                      return `${isLast ? "& " : ""}${value}${
                        unit.length > 2 ? ` ${unit}` : unit
                      }`;
                    })
                    .join(", ")}
                </p>
              </div>
            ) : undefined}
          </div>
        </div>
      </a>
    </li>
  );
}

export default React.memo(ProductListItem);
