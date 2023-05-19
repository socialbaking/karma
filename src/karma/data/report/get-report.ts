import { getReportStore } from "./store";

export function getReport(reportId: string) {
  const store = getReportStore();
  return store.get(reportId);
}
