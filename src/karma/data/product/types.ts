export interface ProductData extends Record<string, unknown> {
    productName: string;
    licencedPartnerId?: string;
}

export interface Product extends ProductData {
    productId: string;
    createdAt: string;
    updatedAt: string;
}