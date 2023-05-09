import {v4} from "uuid";
import {ProductData, Product} from "./types";
import {getProductStore} from "./store";

export async function addProduct(data: ProductData): Promise<Product> {
    const store = getProductStore();
    const productId = v4();
    const product: Product = {
        ...data,
        productId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    await store.set(productId, product);
    return product
}