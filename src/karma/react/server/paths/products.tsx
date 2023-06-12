import {
  useCategory,
  useCopyrightInformation, useData,
  useMetrics,
  useProductMetrics,
  useQuery,
  useQuerySearch,
  useSortedProducts,
} from "../data";
import ClientProductListItem, {
  ProductProps,
} from "../../client/components/product/list-item";
import { SvgTextIcon } from "../../client/components/icons";
import {COPYRIGHT_PUBLIC_LABEL} from "../../../static";
import {Product} from "../../../data";
import {useMemo} from "react";

function ProductListItem(props: ProductProps) {
  const category = useCategory(props.product.categoryId);
  const { isAnonymous } = useData();
  return <ClientProductListItem {...props} category={category} isAnonymous={isAnonymous} />;
}

export interface CopyrightInfoProps {
  product?: Product
  margin?: boolean
}

export function CopyrightInfo({ product, margin }: CopyrightInfoProps) {
  const allProducts = useSortedProducts(true);
  const products = useMemo(() => product ? [product] : allProducts, [allProducts]);
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
                  {(isAnonymous ? COPYRIGHT_PUBLIC_LABEL[contentUrl] : undefined) || "content"}
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
  const products = useSortedProducts(true);
  const metrics = useProductMetrics("month");
  const search = useQuerySearch();
  const { isAnonymous } = useData();
  return (
    <>
      {isAnonymous ? <CopyrightInfo /> : undefined}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {products.map((product, index) => (
            <ProductListItem
              key={index}
              product={product}
              metrics={metrics[product.productId]}
            />
          ))}
        </ul>
      </div>
      {search ? (
        <div className="mx-4">
          <br />
          <br />
          <a href="?">Clear search</a>
          <br />
          <br />
        </div>
      ) : undefined}
      <CopyrightInfo />
    </>
  );
}
