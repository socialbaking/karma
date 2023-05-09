import {v4} from "uuid";
import {Report, ReportData, ReportReference} from "./types";
import {getReportQueueStore, getReportStore} from "./store";

export interface AddReportInput extends ReportData {

}

export async function addReport(data: AddReportInput): Promise<Report> {
    const store = getReportStore();
    const queue = getReportQueueStore();
    const reportId = v4();
    const report: Report = {
        ...data,
        reportId,
        createdAt: new Date().toISOString()
    };
    await store.set(reportId, report);
    const reference: ReportReference = {
      reportId,
      createdAt: report.createdAt
    };
    await queue.set(reportId, reference);
    return report
}