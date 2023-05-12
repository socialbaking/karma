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

export interface MetricsData extends ReportDateData, Expiring, CalculationConsent {
    products: ProductMetricData[];
    countryCode: string;
    timezone?: string;
    anonymous?: boolean;
}

export interface ReportMetricsData extends MetricsData {
    parentReportId?: string;
}

export interface ReportMetrics extends ReportMetricsData, Record<string, unknown> {
    metricsId: string;
    reportId: string;
    reportedAt: string;
    createdAt: string;
    updatedAt: string;
    // consent required to be stored
    calculationConsent: CalculationConsentItem[];
}

export type CountryProductMetricDuration = "day" | "month";

export interface CountryProductMetrics extends MetricsData {
    metricsId: string;
    createdAt: string;
    updatedAt: string;
    duration: CountryProductMetricDuration;
    timezone: string;
    reportingDateKey: keyof ReportDateData;
}