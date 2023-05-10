import {v4} from "uuid";
import {Report, ReportData} from "./types";
import {getReportQueueStore, getReportStore} from "./store";
import {ReportReference} from "./reference";

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
        updatedAt: createdAt
    };
    await store.set(reportId, report);
    const reference: ReportReference = {
      reportId,
      createdAt: report.createdAt
    };
    await queue.set(reportId, reference);
    return report
}