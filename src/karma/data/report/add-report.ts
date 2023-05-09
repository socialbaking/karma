import {v4} from "uuid";
import {Report, ReportData} from "./types";
import {getReportStore} from "./store";

export interface AddReportInput extends ReportData {

}

export async function addReport(data: AddReportInput): Promise<Report> {
    const store = getReportStore();
    const reportId = v4();
    const report: Report = {
        ...data,
        reportId,
        createdAt: new Date().toISOString()
    };
    await store.set(reportId, report);
    return report
}