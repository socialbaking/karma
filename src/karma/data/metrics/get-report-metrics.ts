import {getReportMetricsStore} from "./store";

export function getReportMetrics(reportId: string) {
    const store = getReportMetricsStore();
    return store.get(reportId);
}