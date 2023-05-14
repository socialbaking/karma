import axios from 'axios';
import { useRouter } from 'next/router';
import React, { Suspense } from 'react';
import { QueryClient, useQuery, QueryClientProvider } from '@tanstack/react-query';
import Footer from '@/components/footer';
import Error from '@/components/error';
import ProductType from 'types/product.d';
import Header from '@/components/header';
import ProductFeature from '@/components/product/feature';

const queryClient = new QueryClient();

const useProduct = (productId: string | string[] | undefined) => {
  return useQuery(['product', productId], async () => {
    if (!Number(productId)) return;
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const getProduct = `${API_URL}/products/${productId}`;
    const { data } = await axios.get(getProduct);
    return data.data;
  }, {
    cacheTime: 1000 * 60 * 5, // Cache the data for 5 minutes
    staleTime: 1000 * 60, // Mark data as stale after 1 minute
  });
};

const Product = () => {
  const { query } = useRouter();
  const productId = query.id;
  const { data: product, isLoading, isError } = useProduct(productId);

	if (isError) {
    return <Error message={!isLoading && product && "Something went wrong."} />;
}

  return (
    <div className='h-screen flex flex-col'>
      <Header />
      <main className='flex w-full flex-1 flex-col px-20 p-8'>
        <Suspense fallback={<div>Loading...</div>}>
          {!isLoading && product && <ProductFeature product={product} />}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

const ProductPage = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Product />
    </QueryClientProvider>
  );
};

export default ProductPage;
