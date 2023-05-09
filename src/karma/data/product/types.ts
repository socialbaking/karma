

export interface ProductSizeData extends Record<string, unknown> {
    value: string;
    unit: string;
}

export interface ProductData extends Record<string, unknown> {
    productName: string;
    countryCode?: string;
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

export interface ProductActiveIngredient {
    type: string;
    unit: string;
    value: string;
    prefix?: string;
    calculated?: boolean;
    calculatedUnit?: string;
    size?: ProductSizeData;
}

export interface Product extends ProductData {
    productId: string;
    createdAt: string;
    updatedAt: string;
    activeIngredients?: ProductActiveIngredient[];
}

export interface ProductWithActiveIngredients extends Product {
    activeIngredients: ProductActiveIngredient[];
}

export function isProductWithActiveIngredients(product: Product): product is ProductWithActiveIngredients {
    return !!product.activeIngredients;
}