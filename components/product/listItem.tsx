/* eslint-disable no-undef */
import React, { useMemo } from "react";
import ProductType from "types/product.d";
import { CalendarIcon, GlobeIcon } from "@heroicons/react/solid";

function ListItem({ id, attributes }: ProductType) {
	// const INGREDIENTS = ["CBD", "THC", "CBG"];
	// console.log('ingredients', INGREDIENTS);
	// console.log('attributes', attributes);
	// const ingredients = useMemo(() => {
	//   if (!attributes) return [];
	//   return [...INGREDIENTS].filter((key) => attributes[key]).sort((a, b) => attributes[a] < attributes[b] ? -1 : 1)
	// }, [attributes]);
	// console.log("ingredients xyz", ingredients);

	const productUrl = `/products/${id}`;

	return (
		<li key={id}>
			<a href={productUrl} className="block hover:bg-gray-50">
				<div className="px-4 py-4 sm:px-6">
					<div className="flex items-center justify-between">
						<p className="text-sm font-medium text-indigo-600 truncate">
							{attributes?.name}
						</p>
						<div className="ml-2 flex-shrink-0 flex">
							{/* {ingredients.map(key => (
              <p key={key} className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${attributes?.THC > attributes?.CBD ? "bg-green-400" : "bg-green-100"} bg-green-100 text-green-800`}>
                {key}: {attributes?.[key]}%
              </p>
              ))} */}
							<p
								className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
									attributes?.THC > attributes?.CBD
										? "bg-green-400"
										: "bg-green-100"
								} text-green-800`}
							>
								THC: {attributes?.THC}%
							</p>
							<p
								className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
									attributes?.THC < attributes?.CBD
										? "bg-green-400"
										: "bg-green-100"
								} text-green-800`}
							>
								CBD: {attributes?.CBD}%
							</p>
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
							<p>
								Added on{" "}
								<time dateTime={attributes?.createdAt}>
									{new Intl.DateTimeFormat("en-NZ", {
										year: "numeric",
										month: "2-digit",
										day: "2-digit",
									}).format(new Date(attributes?.createdAt))}
								</time>
							</p>
						</div>
					</div>
				</div>
			</a>
    </li>
	);
}
export default ListItem;