import React, { useMemo } from "react";
import ProductType from "types/product.d";
import { CalendarIcon, GlobeIcon } from "@heroicons/react/solid";

const PercentageLabel = React.memo(({ value, isHigher }: { value: number; isHigher: boolean }) => (
  <span
    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
      isHigher ? "bg-green-400" : "bg-green-100"
    } text-green-800`}
  >
    {value}%
  </span>
));

function ListItem({ id, attributes }: ProductType) {
  const productUrl = `/products/${id}`;

  const isTHCHigher = useMemo(() => attributes?.THC > attributes?.CBD, [attributes]);
  const formattedDate = useMemo(() => {
    if (!attributes?.createdAt) return "";

    return new Intl.DateTimeFormat("en-NZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(attributes.createdAt));
  }, [attributes?.createdAt]);

  return (
    <li key={id}>
      <a href={productUrl} className="block hover:bg-gray-50">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-indigo-600 truncate">{attributes?.name}</p>
            <div className="ml-2 flex-shrink-0 flex">
              <PercentageLabel value={attributes?.THC ?? 0} isHigher={isTHCHigher} />
              <PercentageLabel value={attributes?.CBD ?? 0} isHigher={!isTHCHigher} />
            </div>
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <div className="sm:flex">
              <p className="flex items-center text-sm text-gray-500">
                <GlobeIcon
                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
                {attributes?.category?.data?.attributes?.name}
              </p>
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
