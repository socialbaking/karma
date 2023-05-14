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

export interface CalculationConsentItem extends Record<string, unknown> {
    calculationKey: string;
    consented?: boolean;
    consentedAt?: string;
}

export interface CalculationConsent {
    calculationConsent?: CalculationConsentItem[];
}

export interface ReportData extends ReportDateData, Expiring, CalculationConsent, Record<string, unknown> {
    countryCode: string; // "NZ"
    currencySymbol?: string; // "$"
    timezone?: string; // Pacific/Auckland
    note?: string;
    parentReportId?: string;
    productId?: string;
    productName?: string; // Actual productName, not free text
    productText?: string; // User free text of the product
    productPurchase?: boolean;
    productPurchaseTotalCost?: string | number; // "908.50", capture the user input raw
    productPurchaseItems?: string | number; // "2", capture the user input raw
    productPurchaseItemCost?: string | number; // "450", capture the user input raw
    productPurchaseDeliveryCost?: string | number; // "8.50", capture the user input raw
    productPurchaseFeeCost?: string | number; // "3.50", capture the user input raw
    productPurchasePartnerId?: string;
    productPurchasePartnerName?: string; // Actual partnerName, not free text
    productPurchasePartnerText?: string; // User free text of the partnerName
    productSize?: ProductSizeData;
    createdByUserId?: string;
    anonymous?: boolean;
}

export interface Report extends ReportData {
    reportId: string;
    createdAt: string;
    updatedAt: string;
    reportedAt: string;
}