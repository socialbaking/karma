import { retrieveSystemLogs as example } from "../examples";

export interface RetrieveSystemLogsInput {
    partnerId?: string
}

export interface RetrieveSystemLogOutput {
    uniqueCode?: string;
    value?: number;
    partnerId: string;
    partnerName: string;
    message: string;
    timestamp: string;
}

export async function retrieveSystemLogs({ partnerId }: RetrieveSystemLogsInput): Promise<RetrieveSystemLogOutput[]> {
    return example.response;
}