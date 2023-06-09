import { v4 } from "uuid";
import { Report, ReportData } from "./types";
import {
    REPORT_EXPIRES_IN_MS,
    REPORT_REFERENCE_EXPIRES_IN_MS,
    getReportQueueStore,
    getReportStore,
} from "./store";
import { ReportReference, ReportReferenceData } from "./reference";
import { getExpiresAt } from "../storage";
import { getReportDates } from "../../calculations";
import { getAuthenticationRoles } from "../../authentication";

export async function setReport(data: ReportData & Partial<Report>): Promise<Report> {
    const store = getReportStore();
    const reportId = data.reportId || v4();
    const createdAt = data.createdAt || new Date().toISOString();
    const roles = data.roles || getAuthenticationRoles();
    const report: Report = {
        ...data,
        roles,
        reportId,
        createdAt,
        updatedAt: createdAt,
        reportedAt: createdAt,
        expiresAt: getExpiresAt(REPORT_EXPIRES_IN_MS, data.expiresAt),
    };
    await store.set(reportId, report);
    // Reset reference when report set
    await setReportReference({
        ...getReportDates(report),
        reportId,
        countryCode: report.countryCode,
        type: report.type
    });
    return report;
}

export async function setReportReference(data: ReportReferenceData) {
    const queue = getReportQueueStore();
    const reference: ReportReference = {
        ...data,
        expiresAt: getExpiresAt(REPORT_REFERENCE_EXPIRES_IN_MS),
    };
    await queue.set(data.reportId, reference);
}