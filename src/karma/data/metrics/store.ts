import {getKeyValueStore} from "../kv";
import {MonthlyMetrics, DailyMetrics, ReportMetrics} from "./types";

const REPORT_METRICS_STORE_NAME = "reportMetrics"
const DAILY_METRICS_STORE_NAME = "dailyMetrics"
const MONTHLY_METRICS_STORE_NAME = "monthlyMetrics"

export function getReportMetricsStore() {
    return getKeyValueStore<ReportMetrics>(REPORT_METRICS_STORE_NAME);
}

export function getDailyMetricsStore() {
    return getKeyValueStore<DailyMetrics>(DAILY_METRICS_STORE_NAME);
}

export function getMonthlyMetricsStore() {
    return getKeyValueStore<MonthlyMetrics>(MONTHLY_METRICS_STORE_NAME);
}
