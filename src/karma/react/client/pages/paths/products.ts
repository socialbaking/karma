import {ok} from "../../is";
import {Product} from "../../../../client";
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

    const products = Array.from({ length: items.length }, (ignore, index) => items.item(index))
        .map((item): Product & { element: HTMLElement } => ({
            productId: item.getAttribute("data-product-id"),
            productName: item.getAttribute("data-product"),
            categoryId: item.getAttribute("data-category-id"),
            genericCategoryNames: (item.getAttribute("data-category-geneircs") || "")
                .split("|")
                .filter(Boolean),
            createdAt: "",
            updatedAt: "",
            element: item
        }));

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
            [],
            [],
            text
        );

        console.log({ matches });

        for (const match of matches) {
            match.element.hidden = false;
        }

        const hide = products.filter(
            product => !matches.includes(product)
        );

        for (const match of hide) {
            match.element.hidden = true;
        }
    }

}