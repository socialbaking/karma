import { Report, ReportData } from "./types";
import {setReport} from "./set-report";

export interface AddReportInput extends ReportData {}

export async function addReport(data: AddReportInput): Promise<Report> {
  return setReport(data);
}
