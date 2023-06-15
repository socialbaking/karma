import {ok} from "../../is";
import {Category, Organisation, Product} from "../../../../client";
import {getMatchingProducts} from "../../utils";

export async function products() {
    const form = document.getElementById("search-form");
    const field = document.getElementById("search-field");
    const list = document.getElementById("product-list");
    const items = list.querySelectorAll("li");

    const url = new URL(location.href);

    ok<HTMLFormElement>(form);
    ok<HTMLInputElement>(field);

    form.autocomplete = "off";

    const organisationsJSONElement = document.getElementById("organisations-json");
    const categoriesJSONElement = document.getElementById("categories-json");
    const productsJSONElement = document.getElementById("products-json");

    const organisations: Organisation[] = JSON.parse(organisationsJSONElement.innerHTML.trim());
    const categories: Category[] = JSON.parse(categoriesJSONElement.innerHTML.trim());
    const products: Product[] = JSON.parse(productsJSONElement.innerHTML.trim());

    const productElements = Array.from({ length: items.length }, (ignore, index) => items.item(index))
        .map((item): { productId: string, element: HTMLElement } => ({
            productId: item.getAttribute("data-product-id"),
            element: item
        }));

    const productElementMap = new Map(
        productElements.map(
            ({ productId, element }) => [productId, element]
        )
    );

    field.addEventListener("change", () => {
        filterProductList(field.value);
    });
    field.addEventListener("keyup", () => {
        filterProductList(field.value);
    })

    function filterProductList(text: string) {

        ok<HTMLInputElement>(field);
        if (text) {
            url.searchParams.set(field.name, text);
        } else {
            url.searchParams.delete(field.name);
        }
        history.replaceState({
            [field.name]: text
        }, document.title, url.toString());

        const matches = !text.trim() ? products : getMatchingProducts(
            products,
            organisations,
            categories,
            text
        );

        console.log({ matches });

        for (const match of matches) {
            const element =  productElementMap.get(match.productId);
            if (!element) continue;
            element.hidden = false;
        }

        const hide = products.filter(
            product => !matches.includes(product)
        );

        for (const match of hide) {
            const element =  productElementMap.get(match.productId);
            if (!element) continue;
            element.hidden = true;
        }
    }

}