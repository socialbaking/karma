import {
    AuthenticationRole,
    Category,
    CountryProductMetrics, Partner,
    Product
} from "../../../data";
import {createContext, useContext, useMemo} from "react";
import {ok} from "../../../../is";

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
    metrics?: CountryProductMetrics[];
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

export function useQuery<Q = Record<string, string>>(): Q {
    const { query } = useData();
    ok<Q>(query, "Expected query");
    return query;
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

export function useSortedProducts() {
    const products = useProducts();
    const categories = useCategories();
    return useMemo(() => {
        const categoryOrder = new Map<string, number | undefined>(
            categories.map(category => [category.categoryId, category.order] as const)
        );
        return products
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
    }, [products, categories]);
}

export function useProduct(productId: string): Product | undefined {
    const products = useProducts();
    return useMemo(() => products.find(product => product.productId === productId), [products]);
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

export function useMetrics() {
    const { metrics } = useData();
    return useMemo(() => metrics || [], [metrics]);
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