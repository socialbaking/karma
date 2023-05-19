// Private type
import { ReportDateData } from "./types";
import { Expiring } from "../expiring";

export interface ReportReferenceData extends ReportDateData {
  reportId: string;
  countryCode: string;
}

export interface ReportReference
  extends ReportReferenceData,
    Expiring,
    Record<string, unknown> {}
