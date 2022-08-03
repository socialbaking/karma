import axios from "axios";
import React, { useEffect, useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const { data } = await axios.get(
          "http://localhost:1337/api/products"
        );
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
          {products.map((product) => (
            <li key={product.attributes.id}>
              <a href={`/products/${product.attributes.id}`}>{product.attributes.name}</a>
            </li>
          ))}
        </ul>
      </main>

      <Footer />
    </div>
  );
};

export default Products;