import { v4 } from "uuid";
import { ProductData, Product } from "./types";
import { setProduct } from "./set-product";

export async function addProduct(data: ProductData): Promise<Product> {
  const productId = v4();
  return setProduct({
    ...data,
    productId,
  });
}
