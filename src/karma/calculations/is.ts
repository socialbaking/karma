import { Report, ReportData } from "../client";

export interface ProductReportData {
  // These are the expected field for a completed product report
  type: "purchase" | "product";
  productTotalCost: `${number}` | number;
  productItems: `${number}` | number;
  productItemCost: `${number}` | number;
}

export function isProductReport(
  report: Report
): report is Report & ProductReportData {
  return !!isProductReportData(report);
}

export function isProductReportData(
  report: ReportData
): report is ReportData & ProductReportData {
  return !!(
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
