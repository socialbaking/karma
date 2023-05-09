export interface ActiveIngredientMetrics {
    type: string;
    unit: string;
    value: string;
    // If the calculation of cost takes into account the
    // proportion of this vs total active ingredients
    proportional?: boolean;
}

export interface ReportMetricsData extends Record<string, unknown> {
    activeIngredients: ActiveIngredientMetrics[]
}

export interface ReportMetrics extends ReportMetricsData {
    reportId: string;
    createdAt: string;
    updatedAt: string;
    countryCode: string;
}

export interface DailyMetricsData extends Record<string, unknown> {
    timestamp: string;
    countryCode: string;
}

export interface DailyMetrics extends DailyMetricsData {
    createdAt: string;
    updatedAt: string;
}

export interface MonthlyMetricsData extends Record<string, unknown> {
    timestamp: string;
    countryCode: string;
}

export interface MonthlyMetrics {
    createdAt: string;
    updatedAt: string;
}