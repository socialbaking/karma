// Private type
import {ReportDateData, ReportType} from "./types";
import { Expiring } from "../expiring";

export interface ReportReferenceData extends ReportDateData {
  reportId: string;
  countryCode: string;
  type: ReportType | string;
}

export interface ReportReference
  extends ReportReferenceData,
    Expiring,
    Record<string, unknown> {}
