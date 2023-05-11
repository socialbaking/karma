import {Report, ReportDate} from "./types";

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