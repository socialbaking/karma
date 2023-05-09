import {ProductSizeData} from "../product";

export interface ReportData extends Record<string, unknown> {
    note?: string;
    parentReportId?: string;
    productId?: string;
    productName?: string; // Actual productName, not free text
    productText?: string; // User free text of the product
    productPurchase?: boolean;
    productPurchaseTotalCost?: string; // "908.50", capture the user input raw
    productPurchaseItems?: string; // "2", capture the user input raw
    productPurchaseItemCost?: string; // "450", capture the user input raw
    productPurchaseDeliveryCost?: string; // "8.50", capture the user input raw
    productPurchasePartnerId?: string;
    productPurchasePartnerName?: string; // Actual partnerName, not free text
    productPurchasePartnerText?: string; // User free text of the partnerName
    productSize?: ProductSizeData;
    productDelivered?: boolean;
    createdByUserId?: string;
    anonymous?: boolean;
    countryCode?: string; // "NZL"
}

export interface Report extends ReportData {
    reportId: string;
    createdAt: string;
}

export interface ProductReport extends Report {
    // These are the expected field for a completed product report
    productPurchase: true
    productPurchaseTotalCost: string;
    productPurchaseItems: string;
    productPurchaseItemCost: string;
    productPurchaseDeliveryCost: string;
}

export function isProductReport(report: Report): report is ProductReport {
    return (
        report.productPurchase &&
        typeof report.productPurchaseTotalCost === "string" &&
        typeof report.productPurchaseItemCost === "string" &&
        typeof report.productPurchaseItems === "string" &&
        typeof report.productPurchaseDeliveryCost === "string"
    )
}