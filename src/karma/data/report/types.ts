import { ProductSizeData } from "../product";
import { Expiring } from "../expiring";
import { AuthenticationRole } from "../authentication-role";
import {ActiveIngredientMetrics} from "../metrics";

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

export interface ReportRoleData {
  roles: AuthenticationRole[];
}

export type ReportType = "purchase" | "product" | "poll";

export interface DeprecatedReportData {
  // TODO No longer used fields, but keeping around until v1.0.0
  productPurchase?: boolean;
  productPurchaseTotalCost?: string | number; // "908.50", capture the user input raw
  productPurchaseItems?: string | number; // "2", capture the user input raw
  productPurchaseItemCost?: string | number; // "450", capture the user input raw
  productPurchaseDeliveryCost?: string | number; // "8.50", capture the user input raw
  productPurchaseFeeCost?: string | number; // "3.50", capture the user input raw
  productPurchaseOrganisationId?: string;
  productPurchaseOrganisationName?: string; // Actual organisationName, not free text
  productPurchaseOrganisationText?: string; // User free text of the organisationName
}

type StringNumber = `${number}` | number | string;

export interface ProductReviewReportData {
  comment?: string;
  rating?: string | `${number}` | number;
  vibes?: string;
}
export interface ProductReportData extends DeprecatedReportData, ProductReviewReportData {
  productId?: string;
  productName?: string; // Actual productName, not free text
  productText?: string; // User free text of the product
  productSize?: ProductSizeData;
  productTotalCost: StringNumber; // "908.50", capture the user input raw
  productItems: StringNumber; // "2", capture the user input raw
  productItemCost: StringNumber; // "450", capture the user input raw
  productDeliveryCost?: StringNumber; // "8.50", capture the user input raw
  productFeeCost?: StringNumber; // "3.50", capture the user input raw
  productOrganisationId?: string;
  productOrganisationName?: string; // Actual organisationName, not free text
  productOrganisationText?: string; // User free text of the organisationName
}

export interface PollReportOptionData extends Partial<ActiveIngredientMetrics> {
  title: string;
  votes: `${number}` | string;
}

export interface PollReportData {
  title: string;
  url?: string;
  options: PollReportOptionData[];
}

export type PartialReportData = Partial<PollReportData> & Partial<ProductReportData>

export interface ReportData
  extends ReportDateData,
    Expiring,
    CalculationConsent,
    PartialReportData,
    Record<string, unknown> {
  type: ReportType | string;
  countryCode: string; // "NZ"
  currencySymbol?: string; // "$"
  timezone?: string; // Pacific/Auckland
  note?: string;
  parentReportId?: string;
  createdByUserId?: string;
  createdByPartnerId?: string;
  anonymous?: boolean;
}

export interface Report extends ReportData, ReportRoleData {
  reportId: string;
  createdAt: string;
  updatedAt: string;
  reportedAt: string;
  reports?: Report[];
}
