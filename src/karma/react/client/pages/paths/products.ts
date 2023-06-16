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

    // console.log("Loading data at", new Date().toISOString());

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
    });

    // console.log("Added event listener at", new Date().toISOString());

    let urlReplacedThisMicrotask = false,
        urlReplaceWaitingForTask = false,
        urlReplacements: number[] = [];

    function replaceUrl(): void {
        const target = url.toString();
        if (location.href === target) {
            return;
        }

        ok<HTMLInputElement>(field);
        if (urlReplacedThisMicrotask) {
            if (urlReplaceWaitingForTask) {
                return;
            }
            urlReplaceWaitingForTask = true;
            return queueMicrotask(() => {
                urlReplaceWaitingForTask = false;
                return replaceUrl();
            })
        }

        const now = Date.now()
        urlReplacements = urlReplacements.filter(
            value => (now - value) < 15000
        );

        // console.log(urlReplacements.length, "url replacements in the last 15 seconds");

        try {
            // console.log("history.replaceState attempt", new Date().toISOString())
            history.replaceState({
                [field.name]: url.searchParams.get(field.name)
            }, document.title, target);
            urlReplacements.push(Date.now())
            // console.log("history.replaceState at", new Date().toISOString())
            urlReplacedThisMicrotask = true;
            queueMicrotask(() => {
                urlReplacedThisMicrotask = false;
            });
        } catch {
            // Safari might throw when calling this
            if (urlReplaceWaitingForTask) {
                return;
            }
            urlReplaceWaitingForTask = true;

            // It takes 15 seconds for Safari to allow history.replaceState
            // use again after being rate limited

            let timeout = 2500;
            if (urlReplacements.length > 99) {
                timeout = 7500;
            } else if (urlReplacements.length > 5) {
                timeout = 5000;
            }
            // console.log({ timeout });

            setTimeout(() => {
                urlReplaceWaitingForTask = false;
                return replaceUrl()
            }, timeout);
        }
    }


    function filterProductList(text: string) {
        ok<HTMLInputElement>(field);

        if (url.searchParams.get(field.name) === text) {
            return;
        }

        // console.log("Searching for", text, new Date().toISOString())

        if (text) {
            url.searchParams.set(field.name, text);
        } else {
            url.searchParams.delete(field.name);
        }

        // console.log("Starting match at", new Date().toISOString())
        const matches = !text.trim() ? products : getMatchingProducts(
            products,
            organisations,
            categories,
            text
        );
        // console.log("Matched at", new Date().toISOString())

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

        replaceUrl();
    }

}