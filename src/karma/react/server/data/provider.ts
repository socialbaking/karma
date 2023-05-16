import {
    AuthenticationRole,
    Category,
    CountryProductMetrics,
    Partner,
    Product,
    Organisation,
    CountryProductMetricDuration, ProductMetricData, ActiveIngredientMetrics
} from "../../../data";
import {createContext, useContext, useMemo} from "react";
import {ok} from "../../../../is";
import {getMatchingProducts} from "../../../utils";
import {COPYRIGHT_LINK, COPYRIGHT_SVG_TEXT, COPYRIGHT_TEXT} from "../../../static";
import {SingleProductMetrics} from "../../client/data";

export interface Data {
    body?: unknown;
    result?: unknown;
    error?: unknown;
    query?: unknown;
    submitted?: true;
    url: string;
    isAnonymous: boolean;
    isFragment: boolean;
    products: Product[];
    categories: Category[];
    partners: Partner[];
    organisations: Organisation[];
    metrics: CountryProductMetrics[];
    roles?: AuthenticationRole[];
}

export const DataContext = createContext<Data | undefined>(undefined);
export const DataProvider = DataContext.Provider;

export function useData(): Data {
    const context = useContext(DataContext);
    ok(context, "Expected DataProvider to be used");
    return context;
}

export function useMaybeBody<B>(): B | undefined {
    const { body } = useData();
    if (!body) return undefined;
    ok<B>(body);
    return body;
}

export function useBody<B>(): B {
    const body = useMaybeBody<B>();
    ok(body, "Expected body");
    return body;
}

type QueryRecord = Record<string, string>;

export function useQuery<Q = QueryRecord>(): Q {
    const { query } = useData();
    ok<Q>(query, "Expected query");
    return query;
}

export function useQuerySearch() {
    const query = useQuery();
    return query.search || query.productName || "";
}

export function useMaybeResult<R>(): R | undefined {
    const { result } = useData();
    if (!result) return undefined;
    ok<R>(result);
    return result;
}

export function useResult<R>(): R {
    const result = useMaybeBody<R>();
    ok(result, "Expected result");
    return result;
}

export function useError(): unknown | undefined {
    const { error } = useData();
    return error;
}

export function useSubmitted(): boolean {
    const { submitted } = useData();
    return !!submitted;
}

export function useProducts() {
    const { products } = useData();
    return products;
}

export function useOrganisations() {
    const { organisations } = useData();
    return organisations;
}

export interface CopyrightItem {
    contentUrl: string;
    copyrightUrl: string;
    label: string;
    svg?: string;
}

export function useCopyrightInformation(products: Product[]) {
    return useMemo(() => {
        const websites = [
            ...new Set(
                products.map(
                    product => product.licenceApprovalWebsite
                )
            )
        ]
            .filter(url => COPYRIGHT_TEXT[url])
            .filter(Boolean);
        return websites.map((url): CopyrightItem => {
            const svg = COPYRIGHT_SVG_TEXT[url];
            return {
                contentUrl: url,
                copyrightUrl: COPYRIGHT_LINK[url],
                label: COPYRIGHT_TEXT[url],
                svg: svg ? `data:image/svg+xml;base64,${Buffer.from(svg, "utf-8").toString("base64")}` : undefined
            } as const;
        });
    }, [products]);
}

export function useSortedProducts(isSearch?: boolean) {
    const products = useProducts();
    const categories = useCategories();

    const search = useQuerySearch();
    return useMemo(() => {
        const categoryOrder = new Map<string, number | undefined>(
            categories.map(category => [category.categoryId, category.order] as const)
        );
        const sortedProducts = products
            .slice()
            .sort((a, b) => {
                const categoryOrderA = categoryOrder.get(a.categoryId) ?? Number.MAX_SAFE_INTEGER
                const categoryOrderB = categoryOrder.get(b.categoryId) ?? Number.MAX_SAFE_INTEGER;
                if (categoryOrderA !== categoryOrderB) {
                    return categoryOrderA < categoryOrderB ? -1 : 1;
                }
                const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
                const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
                return orderA < orderB ? -1 : 1;
            });
        if (!isSearch || !search) {
            return sortedProducts;
        }
        return getMatchingProducts(sortedProducts, search);
    }, [products, categories, search]);
}

export function useProduct(productId?: string): Product | undefined {
    const products = useProducts();
    return useMemo(() => {
        if (!productId) return undefined;
        return products.find(product => product.productId === productId)
    }, [products, productId]);
}

export function useCategories() {
    const { categories } = useData();
    return categories;
}

export function useCategory(categoryId?: string): Category | undefined {
    const categories = useCategories();
    return useMemo(() => {
        if (!categoryId) return undefined;
        return categories.find(category => category.categoryId === categoryId)
    }, [categories]);
}

export function usePartners() {
    const { partners } = useData();
    return partners;
}

export function usePartner(partnerId: string) {
    const partners = usePartners();
    return useMemo(() => partners.find(partner => partner.partnerId === partnerId), [partners]);
}

export function useOrganisation(organisationId: string) {
    const organisations = useOrganisations();
    return useMemo(() => organisations.find(organisation => organisation.organisationId === organisationId), [organisationId]);
}

export function useMetrics() {
    const { metrics } = useData();
    return useMemo(() => metrics || [], [metrics]);
}

export type ProductMetricsRecord = Record<string, SingleProductMetrics>;

export function useProductMetrics(duration: CountryProductMetricDuration = "day"): ProductMetricsRecord {
    const metrics = useMetrics();
    return useMemo(() => {
        const durationMetrics = metrics
            .filter(value => value.duration === duration);
        const productIds = new Set(
            durationMetrics
                .flatMap<string>(value => value.products.map(product => product.productId))
        );
        const results: ProductMetricsRecord = {};
        let countryCode: string | undefined = undefined;
        for (const productId of productIds) {
            let matchingMetrics = durationMetrics
                .filter(value => value.products.find(product => product.productId === productId));
            ok(matchingMetrics.length);
            const products = matchingMetrics
                .flatMap<ProductMetricData>(value => value.products.filter(
                    product => product.productId === productId
                ));
            results[productId] = {
                metrics: matchingMetrics,
                products
            };
        }
        console.log(results);
        return results;
    }, [metrics, duration]);
}

export function useMonthlyMetrics() {
    const metrics = useMetrics();
    return useMemo(() => metrics.filter(metric => metric.duration === "month"), [metrics]);
}

export function useDailyMetrics() {
    const metrics = useMetrics();
    return useMemo(() => metrics.filter(metric => metric.duration === "day"), [metrics]);
}

export function useRoles() {
    const { roles } = useData();
    return useMemo(() => roles ?? [], [roles]);
}