import {getSystemLogStore} from "./store";
import {SystemLog} from "./types";

export interface RetrieveSystemLogsInput {
    partnerId?: string
}

export async function listSystemLogs({ partnerId }: RetrieveSystemLogsInput): Promise<SystemLog[]> {
    if (!partnerId) return [];
    const store = await getSystemLogStore();
    const values = await store.values();
    return values.filter(value => value.partnerId === partnerId || !value.partnerId);
}