import {getSystemLogStore} from "./store";
import {SystemLog} from "./types";

export interface RetrieveSystemLogsInput {
    partnerId?: string
}

export async function listSystemLogs({ partnerId }: RetrieveSystemLogsInput): Promise<SystemLog[]> {
    const store = await getSystemLogStore();
    const values = await store.values();
    if (!partnerId) return values;
    return values.filter(value => value.partnerId === partnerId || !value.partnerId);
}