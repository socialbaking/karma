import { calculator } from "./calculator";
import { products } from "./products";

export const paths: Record<string, () => void | Promise<void>> = {
  "/calculator": calculator,
  "/products": products
};

export function runPath() {
  const { pathname } = window.location;
  const pathFn = paths[pathname];
  if (!pathFn) return;
  return pathFn();
}
