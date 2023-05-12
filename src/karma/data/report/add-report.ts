import {v4} from "uuid";
import {Report, ReportData} from "./types";
import {REPORT_EXPIRES_IN_MS, REPORT_REFERENCE_EXPIRES_IN_MS, getReportQueueStore, getReportStore} from "./store";
import {ReportReference, ReportReferenceData} from "./reference";
import {getExpiresAt} from "../expiring-kv";
import {getReportDates} from "../../calculations";


export interface AddReportInput extends ReportData {

}

export async function addReport(data: AddReportInput): Promise<Report> {
    const store = getReportStore();
    const reportId = v4();
    const createdAt = new Date().toISOString();
    const report: Report = {
        ...data,
        reportId,
        createdAt,
        updatedAt: createdAt,
        reportedAt: createdAt,
        expiresAt: data.expiresAt || getExpiresAt(REPORT_EXPIRES_IN_MS)
    };
    await store.set(reportId, report);
    await addReportReference({
        ...getReportDates(report),
        reportId,
        countryCode: data.countryCode
    })
    return report
}

export async function addReportReference(data: ReportReferenceData) {
    const queue = getReportQueueStore();
    const reference: ReportReference = {
        ...data,
        expiresAt: getExpiresAt(REPORT_REFERENCE_EXPIRES_IN_MS),
    };
    await queue.set(data.reportId, reference);
}