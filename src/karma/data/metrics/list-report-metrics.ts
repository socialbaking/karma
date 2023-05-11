import {getReportMetricsStore} from "./store";

export async function listReportMetrics() {
    const store = getReportMetricsStore();
    return store.values();
}