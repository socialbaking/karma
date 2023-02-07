import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Footer from "@/components/footer";
import ProductHeader from "@/components/product/header";
import ProductType  from "types/product.d";
import Header from "@/components/header";
import ProductFeature from "@/components/product/feature";

// get a single product based on the id from slug
const Product = () => {
	const [product, setProduct] = useState<ProductType>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);

	const { asPath, pathname, query } = useRouter();
	// console.log("✅ asPath", asPath);
	// console.log("✅ pathname", pathname);
	// const getIdFromSlug = asPath.split("/")[2];
	const getIdFromSlug = query.id
	// console.log("🚗 ggggetIdFromSlug", getIdFromSlug);

	useEffect(() => {
		if (!Number(getIdFromSlug)) return;
		const fetchData = async () => {
			setLoading(true);
			setError(false);

			const API_URL = process.env.NEXT_PUBLIC_API_URL;
			const getProduct = `${API_URL}/products/${getIdFromSlug}`;
			try {
				const { data } = await axios.get(getProduct);
				const result = data.data;
				console.log("result", result);
				setProduct(result);
			} catch (error) {
				setError(true);
			}
			setLoading(false);
		};
		fetchData();
	}, [getIdFromSlug]);

	if (loading) {
		return <p>Loading...</p>;
	}

	if (error) {
		return <p>Error!</p>;
	}

	return (
		<div className="h-screen flex flex-col">
			<Header />
			<main className="flex w-full flex-1 flex-col px-20 p-8">
				{/* <div className="bg-white shadow overflow-hidden sm:rounded-md">
					<div className="mt-10">
						<p className="text-2xl">{product?.attributes?.name}</p>
						<p>{product?.attributes?.description}</p>
					</div>
				</div> */}
				{!!product&&(
        <ProductFeature product={product} />
				)}
			</main>
			<Footer />
		</div>
	);
}

export default Product;