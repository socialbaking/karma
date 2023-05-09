import {isNumberString, ProductSizeData} from "../product";

export interface ReportData extends Record<string, unknown> {
    countryCode: string; // "NZL"
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
    productPurchaseFeeCost?: string; // "3.50", capture the user input raw
    productPurchasePartnerId?: string;
    productPurchasePartnerName?: string; // Actual partnerName, not free text
    productPurchasePartnerText?: string; // User free text of the partnerName
    productSize?: ProductSizeData;
    createdByUserId?: string;
    anonymous?: boolean;
    orderedAt?: string;
    shippedAt?: string;
    receivedAt?: string;
}

export interface Report extends ReportData {
    reportId: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProductReport extends Report {
    // These are the expected field for a completed product report
    productPurchase: true
    productPurchaseTotalCost: `${number}`;
    productPurchaseItems: `${number}`;
    productPurchaseItemCost: `${number}`;
    productPurchaseDeliveryCost: `${number}`;
    productPurchaseFeeCost?: `${number}`;
}

export function isProductReport(report: Report): report is ProductReport {
    return !!(
        report.productPurchase &&
        isNumberString(report.productPurchaseTotalCost) &&
        isNumberString(report.productPurchaseItemCost) &&
        isNumberString(report.productPurchaseItems) &&
        isNumberString(report.productPurchaseDeliveryCost) &&
        (
            (
                !report.productPurchaseFeeCost &&
                typeof report.productPurchaseFeeCost !== "string"
            ) ||
            isNumberString(report.productPurchaseFeeCost)
        )
    )
}

export interface ReportReference extends Record<string, unknown> {
    reportId: string;
    createdAt: string;
}