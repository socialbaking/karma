import { getReportStore } from "./store";
import { Report } from "./types";

export async function getReport(reportId: string) {
  const store = getReportStore();
  return patchOldReport(await store.get(reportId));
}

export function patchOldReport(report: Report): Report;
export function patchOldReport(report?: Report): Report | undefined;
export function patchOldReport(report?: Report): Report | undefined {
  if (!report) return undefined;
  if (report.type) return report;
  if (!report.productPurchase) return undefined;
  return {
    ...report,
    type: "product-purchase",
    productDeliveryCost:
      report.productDeliveryCost ?? report.productPurchaseDeliveryCost,
    productFeeCost: report.productFeeCost ?? report.productPurchaseFeeCost,
    productItemCost: report.productItemCost ?? report.productPurchaseItemCost,
    productItems: report.productItems ?? report.productPurchaseItems,
    productOrganisationId:
      report.productOrganisationId ?? report.productPurchaseOrganisationId,
    productOrganisationName:
      report.productOrganisationName ?? report.productPurchaseOrganisationName,
    productOrganisationText:
      report.productOrganisationText ?? report.productPurchaseOrganisationText,
    productTotalCost:
      report.productTotalCost ?? report.productPurchaseTotalCost,
  };
}
