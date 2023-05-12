import {getProduct} from "../product";
import {listMetrics} from "./list-metrics";
import {CountryProductMetrics} from "./types";

export async function listProductMetrics(productId: string) {
    const product = await getProduct(productId);
    if (!product) return [];
    const countryCode = product.countryCode || product.licenceCountryCode;
    let metrics = await listMetrics();
    if (countryCode) {
        metrics = metrics.filter(value => value.countryCode === countryCode);
    }
    return metrics
        .map((value): CountryProductMetrics => ({
            ...value,
            products: value.products
                .filter(product => product.productId === productId)
        }))
        .filter(value => value.products.length);
}