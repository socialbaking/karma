import {Report, ReportDateData} from "./types";

export interface ReportDate extends ReportDateData {
    updatedAt: string;
    createdAt: string;
    reportedAt: string;
}

export function getReportDates(report: Report | ReportDate): ReportDate {
    return {
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        receivedAt: report.receivedAt,
        shippedAt: report.shippedAt,
        orderedAt: report.orderedAt,
        reportedAt: report.reportedAt
    }
}