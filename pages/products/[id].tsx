import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Product  from "types/product.d";

// get a single product based on the id from slug
const Product = () => {
  const [product, setProduct] = useState<Product>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const { asPath, pathname } = useRouter();
  console.log("✅ asPath", asPath);
  console.log("✅ pathname", pathname);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      const api_link = `http://localhost:1337/api/products/${asPath.split("/")[2]}`;
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
  } , []);

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
        <h1 className="text-6xl font-bold">
          Welcome to{' '}
          <span className="text-green-600">
            CannaSPY
          </span>
        </h1>

        <p className="mt-3 text-2xl">
          Your experiences. Your data. Your insights.
        </p>

        <ul className="mt-10">
          {product?.attributes?.name}
        </ul>
      </main>
    </div>
  );
}

export default Product;

// export default Products;
// import React from 'react';
// import { useParams } from 'react-router-dom';
// import { useQuery } from '@apollo/react-hooks';
// import { gql } from 'apollo-boost';