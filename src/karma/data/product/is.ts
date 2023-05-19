import { Product, ProductActiveIngredient } from "./types";

export interface ProductWithActiveIngredients extends Product {
  activeIngredients: ProductActiveIngredient[];
}

export function isProductWithActiveIngredients(
  product: Product
): product is ProductWithActiveIngredients {
  return !!product.activeIngredients;
}
