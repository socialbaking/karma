import {Category, Product, ReportDateData, CountryProductMetrics, Report, ReportMetrics} from "../client";

export type CurrencySymbol = "$";

export interface BaseCalculationConfig {
    currencySymbol: CurrencySymbol | string;
}

export interface CalculationConfig extends BaseCalculationConfig {
    countryCode: string;
    timezone: string;
    reportingDateKey: keyof ReportDateData;
    reportingDays: number;
    reportingMonths: number;
}

export interface BaseCalculationContext extends BaseCalculationConfig {
    products: Product[];
    categories: Category[];
    reports: Report[];
}

export interface MetricCalculationContext {
    reportMetrics: ReportMetrics[];
    dailyMetrics: CountryProductMetrics[];
    monthlyMetrics: CountryProductMetrics[];
}

export interface CalculationContext extends CalculationConfig, MetricCalculationContext, BaseCalculationContext {
}