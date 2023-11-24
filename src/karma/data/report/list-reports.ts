import { Report } from "./types";
import { getReportStore } from "./store";
import { patchOldReport } from "./get-report";

export interface ListReportsInput {
    authorizedUserId?: string;
    authorizedPartnerId?: string;
}

export async function listReports({
  authorizedUserId,
  authorizedPartnerId
}: ListReportsInput = {}): Promise<Report[]> {
  if (!(authorizedUserId || authorizedPartnerId)) {
    return []; // Shortcut it
  }
  const store = getReportStore();
  const reports = await store.values();
  return reports
    .filter((partner) => {
      if (!(partner.createdByUserId || partner.createdByPartnerId)) {
        // Be explicit
        return false;
      }
      return (
          partner.createdByUserId === authorizedUserId ||
          partner.createdByPartnerId === authorizedPartnerId
      )
    })
    .map(patchOldReport);
}
