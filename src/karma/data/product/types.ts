

export interface ProductSizeData extends Record<string, unknown> {
    size: string;
    unit: string;
}

export interface ProductData extends Record<string, unknown> {
    productName: string;
    licencedPartnerId?: string;
    // Flag for products we don't have the exact licence date for
    licenceApprovedBeforeGivenDate?: boolean;
    licenceApprovedAt?: string;
    licenceExpiredAt?: string;
    // ISO 3166-1 alpha-3 country code
    licenceCountryCode?: string;
    // Flag for products we don't have the exact availability date for
    availableBeforeGivenDate?: boolean;
    availableAt?: string;
    // For products that we will no longer have available
    availableUntil?: string;
    sizes?: ProductSizeData[];
    // Direct text about the active ingredients, not specific values
    activeIngredientDescriptions?: string[];
    categoryId?: string;
}

export interface ActiveIngredient {
    type: string;
    unit: string;
    value: string;
}

export interface Product extends ProductData {
    productId: string;
    createdAt: string;
    updatedAt: string;
    activeIngredients?: ActiveIngredient[];
}

export interface ProductWithActiveIngredients extends Product {
    activeIngredients: ActiveIngredient[];
}

export function isProductWithActiveIngredients(product: Product): product is ProductWithActiveIngredients {
    return !!product.activeIngredients;
}