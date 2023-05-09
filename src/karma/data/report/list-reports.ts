import {Report} from "./types";
import {getReportStore} from "./store";

export interface ListReportsInput {
    authorizedUserId?: string;
}

export async function listReports({ authorizedUserId }: ListReportsInput = {}): Promise<Report[]> {
    const store = getReportStore();
    const partners = await store.values();
    return partners.filter(partner => partner.createdByUserId === authorizedUserId);
}