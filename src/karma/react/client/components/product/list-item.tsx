import React, { useMemo } from "react";
import {Category, Product} from "../../../../client";
import { CalendarIcon, GlobeIcon } from "../icons";
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
    {type} {label}
  </span>
));

function ListItem({ product, category }: ProductProps) {
  const { productId, ...attributes } = product;
  const productUrl = `/products/${product.productId}`;

  const formattedDate = useMemo(() => {
    if (!attributes?.createdAt) return "";

    return new Intl.DateTimeFormat("en-NZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(attributes.createdAt));
  }, [attributes?.createdAt]);

  const ingredients = useActiveIngredients(product);

  return (
    <li key={productId}>
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
                      <GlobeIcon
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                      />
                      {category.categoryName}
                    </p>
                ) : undefined
              }
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
              <CalendarIcon
                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              {formattedDate && (
                <p>
                  Added on <time dateTime={attributes?.createdAt}>{formattedDate}</time>
                </p>
              )}
            </div>
          </div>
        </div>
      </a>
    </li>
  );
}

export default React.memo(ListItem);
