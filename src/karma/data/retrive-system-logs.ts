import {getSystemLogStore} from "./system-log";

export interface RetrieveSystemLogsInput {
    partnerId?: string
}

export interface RetrieveSystemLogOutput {
    uniqueCode?: string;
    value?: number;
    partnerId: string;
    message: string;
    timestamp: string;
}

export async function retrieveSystemLogs({ partnerId }: RetrieveSystemLogsInput): Promise<RetrieveSystemLogOutput[]> {
    const store = await getSystemLogStore();
    const values = await store.values();
    if (!partnerId) return values;
    return values.filter(value => value.partnerId === partnerId || !value.partnerId);
}