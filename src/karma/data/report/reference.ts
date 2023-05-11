// Private type
import {ReportDateData} from "./types";
import {Expiring} from "../expiring";

export interface ReportReference extends ReportDateData, Expiring, Record<string, unknown> {
    reportId: string;
}