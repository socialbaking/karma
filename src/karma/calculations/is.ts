import { Report, ReportData } from "../client";
import {PollReportData, PollReportOptionData, ProductReportData} from "../client";
import {isLike} from "../../is";

export function isProductReport(
  report?: Report
): report is Report & ProductReportData & { type: "purchase" | "product" } {
  return !!isProductReportData(report);
}

export function isProductReportData(
  report?: ReportData
): report is ReportData & ProductReportData & { type: "purchase" | "product" } {
  return !!(
    report &&
    (report.type === "product" || report.type === "purchase") &&
    isNumberString(report.productTotalCost) &&
    isNumberString(report.productItemCost) &&
    isNumberString(report.productItems)
  );
}

export function isNumberString(value?: unknown): value is `${number}` | number {
  return (
    (typeof value === "string" && /^-?\d+(?:\.\d+)?$/.test(value)) ||
    typeof value === "number"
  );
}

function isPollReportOptionData(value: unknown): value is PollReportOptionData {
  return (
      isLike<PollReportOptionData>(value) &&
      typeof value.title === "string" &&
      typeof value.votes === "string" &&
      isNumberString(value.votes)
  )
}

export function isPollReportData(
    report: ReportData
): report is ReportData & PollReportData & { type: "poll" } {
  return !!(
      report.type === "poll" &&
      typeof report.title === "string" &&
      Array.isArray(report.options) &&
      report.options.length &&
      report.options.every(isPollReportOptionData)
  )
}