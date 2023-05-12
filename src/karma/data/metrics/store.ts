import {getExpiringStore} from "../expiring-kv";
import {ReportMetrics, CountryProductMetrics} from "./types";
import {Expiring} from "../expiring";

const METRICS_VERSION = 2;

const REPORT_METRICS_STORE_NAME = "reportMetrics"
const DAILY_METRICS_STORE_NAME = "dailyMetrics"
const MONTHLY_METRICS_STORE_NAME = "monthlyMetrics"

function getMetricsStore<T extends Expiring>(name: string) {
    return getExpiringStore<T>(`${name}_v${METRICS_VERSION}`);
}

export function getReportMetricsStore() {
    return getMetricsStore<ReportMetrics>(REPORT_METRICS_STORE_NAME);
}

export function getDailyMetricsStore() {
    return getMetricsStore<CountryProductMetrics>(DAILY_METRICS_STORE_NAME);
}

export function getMonthlyMetricsStore() {
    return getMetricsStore<CountryProductMetrics>(MONTHLY_METRICS_STORE_NAME);
}
