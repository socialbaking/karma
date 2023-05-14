import {
    AuthenticationRole,
    Category,
    CountryProductMetrics, Partner,
    Product
} from "../../../data";
import {createContext, useContext, useMemo} from "react";
import {ok} from "../../../../is";

export interface Data {
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

export function useProducts() {
    const { products } = useData();
    return products;
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