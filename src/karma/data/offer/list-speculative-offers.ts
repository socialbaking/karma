import {listProducts, Product} from "../product";
import {listMonthlyMetrics} from "../metrics";
import {Offer} from "@opennetwork/logistics";
import {v5} from "uuid";
import {isNumberString} from "../../calculations";

export interface ListSpeculativeOffersOptions {
    public?: boolean;
}

export async function listSpeculativeOffers(options: ListSpeculativeOffersOptions = {}) {
    const products = await listProducts(options);

    const metrics = await listMonthlyMetrics();

    return products.flatMap<Offer>(getProductOffers);

    function getProductOffers(product: Product): Offer[] {
        const matching = metrics.find(metrics => (
            metrics.products.length === 1 &&
            metrics.products.find(metricProduct => metricProduct.productId === product.productId)
        ));

        if (!matching) return [];

        const size = (
            product.sizes?.find(size => isNumberString(size.value)) ??
            product.sizes?.[0]
        )
        if (!size) return [];
        if (!isNumberString(size.value)) return [];

        const unit = size.unit;

        const metric = matching.products[0].activeIngredients.find(value => (
            value.size &&
            value.size.unit === size.unit &&
            value.size.value === size.value &&
            value.type === unit &&
            value.unit === `${matching.currencySymbol}/${unit}`
        ));

        if (!metric) return [];

        const countryCode = product.countryCode || matching.countryCode || "NZ";

        const currency = {
            "NZ": "NZD"
        }[countryCode]

        const offer: Offer = {
            offerId: v5("offer", product.productId),
            status: "speculative",
            items: [
                {
                    type: "product",
                    productId: product.productId,
                    quantity: 1
                }
            ],
            currency: currency ?? "",
            price: (Math.round((+metric.value) * (+size.value) * 100) / 100).toFixed(2),
            currencySymbol: matching.currencySymbol,
            countryCode,
            createdAt: matching.createdAt,
            updatedAt: matching.updatedAt
        }

        return [
            offer
        ];
    }
}