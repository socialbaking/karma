import React, { Suspense } from "react";
import {
  QueryClient,
  useQuery,
  QueryClientProvider,
} from "@tanstack/react-query";
import axios from "axios";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Error from "@/components/error";
import type ProductType from "types/product.d";
import ListItem from "@/components/product/listItem";

const queryClient = new QueryClient();

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API = `${API_URL}/products?populate=category`;

const Products = () => {
  const {
    isLoading,
    isError,
    data: products,
    error,
  } = useQuery<ProductType[], Error>(["products"], async () => {
    const { data } = await axios.get(API);
    const result = data.data;

    console.log("data", data);
    return result;
  });

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <main className="flex w-full flex-1 flex-col px-20 p-8">
          <div>Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError) {
    return <Error message={error?.message ?? "Something went wrong."} />;
  }

  if (!products || products.length === 0) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <main className="flex w-full flex-1 flex-col px-20 p-8">
          <span>No products found</span>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex w-full flex-1 flex-col px-20 p-8">
        <Suspense fallback={<div>Loading...</div>}>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {products.map(({ id, attributes }) => (
                // Use MemoizedListItem instead of ListItem
                <MemoizedListItem key={id} id={id} attributes={attributes} />
              ))}
            </ul>
          </div>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

const MemoizedListItem = React.memo(ListItem);

interface ProductsErrorBoundaryProps {
	children: React.ReactNode;
}

class ProductsErrorBoundary extends React.Component<ProductsErrorBoundaryProps> {
	state = { hasError: false };

	static getDerivedStateFromError(error: any) {
		return { hasError: true };
	}

	componentDidCatch(error: any, errorInfo: any) {
		console.error(error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return <Error message="Something went wrong. Please try again later." />;
		}

		return this.props.children;
	}
}

export default function ProductsPage() {
	return (
		<QueryClientProvider client={queryClient}>
			<ProductsErrorBoundary>
				<Products />
			</ProductsErrorBoundary>
		</QueryClientProvider>
	);
}
