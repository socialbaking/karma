import React from "react";
import { Product } from "../../../../client";
import {useActiveIngredients} from "./utils";

export interface ProductProps {
	product: Product
}

const ProductFeature = ({product}: ProductProps) => {
	// const features = rest?.features; //prob?
	// const { description } = features;
	// const { attributes } = product;
	const { id, ...attributes } = product;
	console.log("id", id);

	const ingredients = useActiveIngredients(product);

	return (
		<div className="bg-white">
			<section
				aria-labelledby="features-heading"
				className="mx-auto max-w-7xl py-32 sm:px-2 lg:px-8"
			>
				<div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
					<div className="max-w-3xl">
						<h2
							id="features-heading"
							className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
						>
							{attributes?.productName}
						</h2>
					</div>
					<div className="ml-2 flex-shrink-0 flex">
						{
							ingredients
								.map(({ type, label, sortIndex }, index) => (
									<p
										className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
											sortIndex === 0
												? "bg-green-400"
												: "bg-green-100"
										} text-green-800`}
									>
										{type}: {label}
									</p>
								))
						}
					</div>
				</div>
			</section>
		</div>
	);
};

export default ProductFeature;