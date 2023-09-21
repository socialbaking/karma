import {listProducts, Product, ProductSizeData} from "../product";
import {ActiveIngredientMetrics, CountryProductMetrics, listMonthlyMetrics, ProductMetricData} from "../metrics";
import {Offer} from "@opennetwork/logistics";
import {v5} from "uuid";
import {isNumberString} from "../../calculations";

export interface ListSpeculativeOffersOptions {
    public?: boolean;
}

export async function listSpeculativeOffers(options: ListSpeculativeOffersOptions = {}): Promise<Offer[]> {
    const [products, generics] = await Promise.all([
        listProducts(options),
        listProducts({
            generic: true
        })
    ]);

    const metrics = await listMonthlyMetrics();

    interface ProductMetricInfo {
        product: Product;
        metric?: ActiveIngredientMetrics;
        size: ProductSizeData;
        productMetric: ProductMetricData;
        unit: string;
        matching?: CountryProductMetrics;
    }
    const info: ProductMetricInfo[] = products.flatMap<ProductMetricInfo>(getProductMetric);

    const productOffers = info.flatMap(getProductOffers);

    const units = [...new Set(info.map(({ metric }) => metric.unit))];
    console.log({
        units,
    })

    const genericOffers = generics.flatMap(getGenericProductOffer);

    return productOffers.concat(genericOffers);

    function getProductMetric(product: Product): ProductMetricInfo[] {
        function getProduct(metrics: CountryProductMetrics) {
            if (product.countryCode && product.countryCode !== metrics.countryCode) {
                return undefined;
            }
            return metrics.products.find(metricProduct => metricProduct.productId === product.productId);
        }
        const sortedMatching = metrics
            .filter(getProduct)
            .sort((a, b) => a[a.reportingDateKey] > b[b.reportingDateKey] ? -1 : 1)

        const matching = sortedMatching[0];

        if (!matching) return [];
        const productMetric = getProduct(matching);

        const size = (
            product.sizes?.find(size => isNumberString(size.value)) ??
            product.sizes?.[0]
        )
        if (!size) return [];
        if (!isNumberString(size.value)) return [];

        const unit = size.unit;

        const metric = productMetric.activeIngredients.find(value => (
            value.size &&
            value.size.unit === size.unit &&
            value.size.value === size.value &&
            value.type === unit &&
            value.unit === `${matching.currencySymbol}/${unit}` &&
            value.calculation === "mean"
        ));

        const info: ProductMetricInfo = {
            metric,
            matching,
            unit,
            productMetric,
            size,
            product,
        };

        return [info];
    }

    function getProductOffers({ metric, matching, size, product }: ProductMetricInfo): Offer[] {
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
                    quantity: 1,
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

    function getGenericProductOffer(product: Product): Offer[] {





        return [];
    }
}