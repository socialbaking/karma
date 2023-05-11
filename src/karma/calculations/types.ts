import {Category, Product} from "../client";
import {Report, ReportMetrics} from "../data";

export type CurrencySymbol = "$";

export interface CalculationContext {
    currencySymbol: CurrencySymbol | string;
    products: Product[];
    categories: Category[];
    reports: Report[];
    reportMetrics: ReportMetrics[]
}