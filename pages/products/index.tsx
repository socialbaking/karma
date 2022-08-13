import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProductHeader from "@/components/product/header";
import { CalendarIcon, CalculatorIcon, VariableIcon, UsersIcon, GlobeIcon } from '@heroicons/react/solid'

type Product = {
  id: number;
  attributes: {
    name: string;
    THC: number;
    CBD: number;
    createdAt: string;
    updatedAt: string;
    category: {
      data: {
        id: number;
        attributes: {
          name: string;
        };
      };
    }
  };
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const { data } = await axios.get(
          "http://localhost:1337/api/products?populate=category"
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

  const INGREDIENTS = ["CBD", "THC", "CBG"] as const;
  const attributes = products.map(product => product.attributes);
  const ingredients = useMemo(() => {
    if (!attributes) return [];
    return [...INGREDIENTS].filter(key => attributes[key]).sort((a, b) => attributes[a] < attributes[b] ? -1 : 1)
  }, [attributes]


  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex w-full flex-1 flex-col px-20 p-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {products.map((product) => (
            <li key={product.id}>
              <a href="#" className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">{product?.attributes?.name}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                    {ingredients.map(key => (
                    <p key={key} className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product?.attributes?.[key] > product?.attributes?.[key] ? "bg-green-400" : "bg-green-100"} bg-green-100 text-green-800`}>
                      {key}: {product?.attributes?.[key]}%
                      </p>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <GlobeIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        {product?.attributes?.category?.data?.attributes?.name}
                      </p>
                      {/* <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <CalculatorIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none" viewBox="0 0 18 18" height="20" width="20"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.523 9.648L9.648 3.773 3.773 9.648l5.875 5.875 5.875-5.875zM9.648.944L.945 9.648l8.703 8.704 8.704-8.704L9.648.944z" fill="text-gray-400"></path></svg>
                        {product?.attributes?.THC}%
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <VariableIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        {product?.attributes?.CBD}%
                      </p> */}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                    <p>
                      Added on <time dateTime={product?.attributes?.createdAt}>{
                        new Intl.DateTimeFormat('en-NZ', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(product?.attributes?.createdAt))
                      }</time>
                    </p>
                  </div>
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
        </div>
      </main>
      <Footer />
    </div>
  )
};

export default Products;