import {v4} from "uuid";
import {Report, ReportData} from "./types";
import {REPORT_EXPIRES_IN_MS, REPORT_REFERENCE_EXPIRES_IN_MS, getReportQueueStore, getReportStore} from "./store";
import {ReportReference} from "./reference";
import {getExpiresAt} from "../expiring-kv";
import {getReportDates} from "../../calculations";


export interface AddReportInput extends ReportData {

}

export async function addReport(data: AddReportInput): Promise<Report> {
    const store = getReportStore();
    const queue = getReportQueueStore();
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
    const reference: ReportReference = {
        ...getReportDates(report),
        reportId,
        expiresAt: getExpiresAt(REPORT_REFERENCE_EXPIRES_IN_MS)
    };
    await queue.set(reportId, reference);
    return report
}
