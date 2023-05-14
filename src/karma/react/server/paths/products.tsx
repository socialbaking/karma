import {useCategory, useProducts} from "../data";
import ClientProductListItem, { ProductProps } from "../../client/components/product/list-item";

function ProductListItem(props: ProductProps) {
    const category = useCategory(props.product.categoryId);
    return <ClientProductListItem {...props} category={category} />
}


export function Products() {
    const products = useProducts();
    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
                {products.map((product, index) => (
                    <ProductListItem key={index} product={product} />
                ))}
            </ul>
        </div>
    )
}