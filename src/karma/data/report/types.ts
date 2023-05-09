export interface ReportData extends Record<string, unknown> {
    message?: string;
    productId?: string;
    productText?: string;
    productPurchase?: boolean;
    productPurchaseTotalCost?: string; // "900.00", capture the user input raw
    productPurchaseItems?: number; // 2
    productPurchaseItemCost?: number; // 450
    createdByUserId?: string;
    anonymous?: boolean;
}

export interface Report extends ReportData {
    reportId: string;
    createdAt: string;
}