import React, { useMemo } from "react";
import {Category, Product} from "../../../../client";
import {CalendarIcon, CategoryIcon, GlobeIcon, PrescriptionBottleIcon} from "../icons";
import {ActiveIngredient, useActiveIngredients} from "./utils";

export interface ProductProps {
  product: Product;
  category?: Category;
}

export interface PercentageLabelProps extends ActiveIngredient {

}

const PercentageLabel = React.memo(({ type, label, sortIndex }: PercentageLabelProps) => (
  <span
    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        sortIndex === 0 ? "bg-green-400" : "bg-green-100"
    } text-green-800`}
  >
    {label} {type}
  </span>
));

function ListItem({ product, category }: ProductProps) {
  const { productId, ...attributes } = product;
  const productUrl = `/calculator?productName=${encodeURIComponent(product.productName)}`;

  const ingredients = useActiveIngredients(product);

  return (
    <li>
      <a href={productUrl} className="block hover:bg-gray-50">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-indigo-600 truncate">{attributes?.productName}</p>
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

export default React.memo(ListItem);
