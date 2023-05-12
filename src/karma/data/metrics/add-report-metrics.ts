import {getReportMetricsStore} from "./store";
import {MetricsData, ReportMetrics} from "./types";
import {v4} from "uuid";

export const NO_REPORT_ID_DEFAULT: string = "";

export async function addReportMetrics(data: MetricsData) {
    const store = getReportMetricsStore();
    const metricsId = v4();
    const metricsKey = `withoutReport_${metricsId}`;

    const { calculationConsent } = data;
    if (!calculationConsent?.length) {
        throw new Error("No consent given to store report metrics");
    }

    const createdAt = new Date().toISOString();
    const metrics: ReportMetrics = {
        ...data,
        metricsId,
        reportedAt: data.reportedAt ?? createdAt,
        updatedAt: createdAt,
        createdAt,
        reportId: NO_REPORT_ID_DEFAULT,
        calculationConsent
    };

    await store.set(metricsKey, metrics);
}