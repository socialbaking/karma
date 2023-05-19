import { seed as original } from "./static-initial";
import { seed as remote } from "./remote-source";
import { listProducts } from "../../product";

export async function seed() {
  try {
    await remote();
  } catch (error) {
    const products = await listProducts();

    if (products.length) {
      console.warn(
        "Fetch seed failed, but products exist, so not trying static seed"
      );
      console.warn(error);
      return;
    }

    console.warn("Fetch seed failed, trying original", error);
    await original();
  }
}
