import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Footer from "@/components/footer";
import ProductHeader from "@/components/product/header";
import Product  from "types/product.d";
import Header from "@/components/header";

// get a single product based on the id from slug
const Product = () => {
  const [product, setProduct] = useState<Product>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const { asPath, pathname } = useRouter();
  console.log("✅ asPath", asPath);
  console.log("✅ pathname", pathname);
  const getIdFromSlug = asPath.split("/")[2];
  console.log("🚗 ggggetIdFromSlug", getIdFromSlug);

  useEffect(() => {
    if (!Number(getIdFromSlug)) return;
    const fetchData = async () => {
      setLoading(true);
      setError(false);

      const api_link = `http://localhost:1337/api/products/${getIdFromSlug}`;
      console.log("❌ api_link", api_link);
      try {
        const { data } = await axios.get(api_link);
        const result = data.data;
        console.log("result", result);
        setProduct(result);
      } catch (error) {
        setError(true);
      }
      setLoading(false);
    };
    fetchData();
  } , [getIdFromSlug]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error!</p>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Header />

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <ProductHeader />
        <p className="mt-3 text-2xl">
          Your experiences. Your data. Your insights.
        </p>

        <ul className="mt-10">
          {product?.attributes?.name}
        </ul>
      </main>
      <Footer />
    </div>
  );
}

export default Product;