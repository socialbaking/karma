import {
  ReactData,
  useCategories,
  useCategory,
  useCopyrightInformation,
  useData,
  useMetrics, useOrganisations,
  useProductMetrics,
  useQuery,
  useQuerySearch,
  useSortedProducts,
} from "../data";
import ClientProductListItem, {
  ProductProps,
} from "../../client/components/product/list-item";
import { SvgTextIcon } from "../../client/components/icons";
import { COPYRIGHT_PUBLIC_LABEL } from "../../../static";
import { Product } from "../../../data";
import { useMemo } from "react";
import {FastifyReply, FastifyRequest} from "fastify";
import {getMatchingProducts} from "../../../utils";

export const path = "/products";
export const anonymous = true;

type Querystring = {
  productName?: string;
  search?: string;
}

type Schema = {
  Querystring: Querystring;
}

export async function handler(request: FastifyRequest<Schema>, response: FastifyReply, { products, categories, organisations }: ReactData) {
  const search = getQuerySearch();
  if (search) {
    const matching = getMatchingProducts(
        products,
        organisations,
        categories,
        search
    );
    if (matching.length === 1) {
      response.header("Location", `/product/${matching[0].productId}`);
      response.status(302);
      response.send();
      return;
    }
  }

  function getQuerySearch() {
    return request.query.search || request.query.productName || "";
  }
}

function ProductListItem(props: ProductProps) {
  const category = useCategory(props.product.categoryId);
  const { isAnonymous } = useData();
  return (
    <ClientProductListItem
      {...props}
      category={category}
      isAnonymous={isAnonymous}
    />
  );
}

export interface CopyrightInfoProps {
  product?: Product;
  products?: Product[]
  margin?: boolean;
}

export function CopyrightInfo({ product, products: givenProducts, margin }: CopyrightInfoProps) {
  const allProducts = useSortedProducts(true);
  const products = useMemo(
    () => givenProducts ? givenProducts : (product ? [product] : allProducts),
    [allProducts, givenProducts]
  );
  const copyright = useCopyrightInformation(products);
  const { isAnonymous } = useData();
  if (!copyright.length) return null;
  return (
    <ul className="list-none">
      {copyright.map(({ contentUrl, copyrightUrl, label, svg }, index) => (
        <li key={index} className="flex flex-row items-center my-4">
          {svg ? <img alt="" role="presentation" src={svg} /> : undefined}
          <span className={margin === false ? "" : "mx-4"}>
            This page includes details derived or about&nbsp;
            <a
              href={contentUrl}
              target="_blank"
              className="text-blue-600 hover:bg-white underline hover:underline-offset-2"
            >
              {(isAnonymous ? COPYRIGHT_PUBLIC_LABEL[contentUrl] : undefined) ||
                "content"}
            </a>
            &nbsp;published by&nbsp;
            <a
              href={copyrightUrl}
              target="_blank"
              className="text-blue-600 hover:bg-white underline hover:underline-offset-2"
            >
              {label}
            </a>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Products() {
  const allProducts = useSortedProducts(false);
  const products = useSortedProducts(true);
  const includedProductIds = useMemo(() => products.map(product => product.productId), [products]);
  const metrics = useProductMetrics("month");
  const search = useQuerySearch();
  const { isAnonymous } = useData();
  const organisations = useOrganisations();
  const categories = useCategories();
  return (
    <>
      {isAnonymous ? <CopyrightInfo /> : undefined}
      <script type="application/json" id="organisations-json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organisations) }} />
      <script type="application/json" id="categories-json" dangerouslySetInnerHTML={{ __html: JSON.stringify(categories) }} />
      <script type="application/json" id="products-json" dangerouslySetInnerHTML={{ __html: JSON.stringify(allProducts) }} />
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200" id="product-list">
          {allProducts.map((product, index) => (
            <ProductListItem
              key={index}
              product={product}
              isDefaultVisible={includedProductIds.includes(product.productId)}
              metrics={metrics[product.productId]}
            />
          ))}
        </ul>
      </div>
      <div className="mx-4" id="clear-search-container" hidden={!search}>
        <br />
        <br />
        <a
            id="clear-search"
            href="?"
            className="text-blue-600 hover:bg-white underline hover:underline-offset-2"
        >
          Clear search
        </a>
        <br />
        <br />
      </div>
      <CopyrightInfo />
    </>
  );
}

export const Component = Products;