import {useProducts} from "../data/provider";

export function Products() {
    const products = useProducts();
    return (
        <div className="product-list">
            {products.map((product, index) => (
                <div key={index} className="product-list-item">
                    <div className="product-list-item-name">{product.productName}</div>
                    <pre className="product-list-item-ingredients">
                        {JSON.stringify(product.activeIngredients, undefined, "  ")}
                    </pre>
                </div>
            ))}
        </div>
    )
}