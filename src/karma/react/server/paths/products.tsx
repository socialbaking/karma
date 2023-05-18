import {
    useCategory,
    useCopyrightInformation,
    useMetrics,
    useProductMetrics,
    useQuery, useQuerySearch,
    useSortedProducts
} from "../data";
import ClientProductListItem, { ProductProps } from "../../client/components/product/list-item";
import {SvgTextIcon} from "../../client/components/icons";

function ProductListItem(props: ProductProps) {
    const category = useCategory(props.product.categoryId);
    return <ClientProductListItem {...props} category={category} />
}

export function Products() {
    const products = useSortedProducts(true);
    const copyright = useCopyrightInformation(products);
    const metrics = useProductMetrics("month");
    const search = useQuerySearch();
    return (
        <>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                    {products.map((product, index) => (
                        <ProductListItem key={index} product={product} metrics={metrics[product.productId]} />
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
            {
                copyright.length ? (
                    <ul className="list-none">
                        {copyright.map(
                            ({
                                 contentUrl,
                                 copyrightUrl,
                                 label,
                                 svg
                             }, index) => (
                                <li key={index} className="flex flex-row items-center my-4">
                                    {svg ? <img role="presentation" src={svg} /> : undefined}
                                    <span className="mx-4">
                                        This page includes&nbsp;
                                        <a href={contentUrl} target="_blank" className="text-blue-600 hover:bg-white underline hover:underline-offset-2">content published</a>
                                        &nbsp;by&nbsp;
                                        <a href={copyrightUrl} target="_blank" className="text-blue-600 hover:bg-white underline hover:underline-offset-2">{label}</a>
                                    </span>
                                </li>
                            )
                        )}
                    </ul>
                ) : undefined
            }
        </>
    )
}