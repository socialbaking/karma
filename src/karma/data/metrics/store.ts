import {getKeyValueStore} from "../kv";
import {ReportMetrics, CountryProductMetrics} from "./types";

const REPORT_METRICS_STORE_NAME = "reportMetrics"
const DAILY_METRICS_STORE_NAME = "dailyMetrics"
const MONTHLY_METRICS_STORE_NAME = "monthlyMetrics"

export function getReportMetricsStore() {
    return getKeyValueStore<ReportMetrics>(REPORT_METRICS_STORE_NAME);
}

export function getDailyMetricsStore() {
    return getKeyValueStore<CountryProductMetrics>(DAILY_METRICS_STORE_NAME);
}

export function getMonthlyMetricsStore() {
    return getKeyValueStore<CountryProductMetrics>(MONTHLY_METRICS_STORE_NAME);
}
