import {Report} from "./types";
import {ReportReference} from "./reference";
import {getExpiringStore, MONTH_MS} from "../expiring-kv";

// We want the report to stay around a little longer than the
// reference in the queue
export const REPORT_EXPIRES_IN_MS = 6 * MONTH_MS;
export const REPORT_REFERENCE_EXPIRES_IN_MS = 2.5 * MONTH_MS;

const STORE_NAME = "report" as const;
const QUEUE_STORE_NAME = "reportQueue" as const;

export function getReportStore() {
    return getExpiringStore<Report>(STORE_NAME);
}

export function getReportQueueStore() {
    return getExpiringStore<ReportReference>(QUEUE_STORE_NAME);
}
