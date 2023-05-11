import {ReportDateData} from "../report";
import {ProductSizeData} from "../product";

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

export interface ReportMetricsData extends ReportDateData, Record<string, unknown> {
    activeIngredients: ActiveIngredientMetrics[];
    reportId: string;
    productId: string;
    countryCode: string;
    reportedAt: string;
}

export interface ReportMetrics extends ReportMetricsData {
    createdAt: string;
    updatedAt: string;
}

export interface ProductMetricData extends Record<string, unknown> {
    productId: string;
    activeIngredients: ActiveIngredientMetrics[];
}

export interface CountryProductMetricData extends Record<string, unknown> {
    products: ProductMetricData[];
}

export type CountryProductMetricDuration = "day" | "month";

export interface CountryProductMetrics extends CountryProductMetricData {
    createdAt: string;
    updatedAt: string;
    countryCode: string;
    duration: CountryProductMetricDuration;
    timestamp: string;
    timezone: string;
}