import { Report } from "./types";
import { getReportStore } from "./store";
import { patchOldReport } from "./get-report";

export interface ListReportsInput {
  authorizedUserId?: string;
}

export async function listReports({
  authorizedUserId,
}: ListReportsInput = {}): Promise<Report[]> {
  if (!authorizedUserId) {
    return []; // Shortcut it
  }
  const store = getReportStore();
  const reports = await store.values();
  return reports
    .filter((partner) => {
      if (!partner.createdByUserId) {
        // Be explicit
        return false;
      }
      return partner.createdByUserId === authorizedUserId
    })
    .map(patchOldReport);
}
