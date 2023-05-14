import React from "react";
import ProductType from "types/product.d";

const ProductFeature = ({product}: ProductType) => {
	// const features = rest?.features; //prob?
	// const { description } = features;
	// const { attributes } = product;
	const { id, attributes } = product;
	console.log("id", id);

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
							{attributes?.name}
						</h2>
						<p className="mt-4 text-gray-500">
							{attributes?.description}
						</p>
					</div>
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
			</section>
		</div>
	);
};

export default ProductFeature;