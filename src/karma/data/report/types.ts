import {ProductSizeData} from "../product";
import {Expiring} from "../expiring";

export interface ReportDateData {
    orderedAt?: string;
    shippedAt?: string;
    receivedAt?: string;
    updatedAt?: string;
    createdAt?: string;
    reportedAt?: string;
}

export interface ReportDate extends ReportDateData {
    createdAt: string;
    updatedAt: string;
    reportedAt: string;
}

export interface ReportData extends ReportDateData, Expiring, Record<string, unknown> {
    countryCode: string; // "NZ"
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
}

export interface Report extends ReportData, ReportDate {
    reportId: string;
}