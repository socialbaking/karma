import axios from "axios";
import React, { useEffect, useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Error from "@/components/error";
import ProductType  from "types/product.d";
import ListItem from "@/components/product/listItem";

const Products = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const API = `${API_URL}/products?populate=category`;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const { data } = await axios.get(API);
        const result = data.data;
        console.log("result", result);
        setProducts(result);
      } catch (error) {
        setError(true);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <></>;
  }

  if (error) {
    return <Error message="Something went wrong." />;
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex w-full flex-1 flex-col px-20 p-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
        {products.map((x) => (
          <ListItem key={x.id} id={x.id} attributes={x.attributes} />
        ))}
        </ul>
        </div>
      </main>
      <Footer />
    </div>
  )
};

export default Products;