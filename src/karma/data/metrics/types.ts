import {CalculationConsent, CalculationConsentItem, ReportDateData} from "../report";
import {ProductSizeData} from "../product";
import {Expiring} from "../expiring";

export interface ActiveIngredientMetrics extends Record<string, unknown> {
    type: string;
    unit: string;
    value: string;
    // If the calculation of cost takes into account the
    // proportion of this vs total active ingredients
    proportional?: boolean;
    mean?: boolean;
    size?: ProductSizeData;
    prefix?: string;
}

export interface ProductMetricData extends Record<string, unknown> {
    productId: string;
    activeIngredients: ActiveIngredientMetrics[];
}

export interface MetricsData extends ReportDateData {
    products: ProductMetricData[];
}

export interface ReportMetrics extends MetricsData, Expiring, CalculationConsent, Record<string, unknown> {
    reportId: string;
    countryCode: string;
    reportedAt: string;
    createdAt: string;
    updatedAt: string;
    // consent required
    calculationConsent: CalculationConsentItem[];
}

export type CountryProductMetricDuration = "day" | "month";

export interface CountryProductMetrics extends MetricsData, Expiring {
    createdAt: string;
    updatedAt: string;
    countryCode: string;
    duration: CountryProductMetricDuration;
    timezone: string;
    reportingDateKey: keyof ReportDateData;
}