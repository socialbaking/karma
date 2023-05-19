import { Report } from "./types";
import { getReportStore } from "./store";

export interface ListReportsInput {
  authorizedUserId?: string;
}

export async function listReports({
  authorizedUserId,
}: ListReportsInput = {}): Promise<Report[]> {
  const store = getReportStore();
  const reports = await store.values();
  return reports.filter(
    (partner) => partner.createdByUserId === authorizedUserId
  );
}
