import {getKeyValueStore} from "./kv";
import {v4} from "uuid";

const SYSTEM_LOG_STORE_NAME = "systemLog" as const;

export interface SystemLogData {
    uniqueCode?: string;
    value?: number;
    partnerId: string;
    message: string;
    timestamp?: string;
}

export interface SystemLog extends SystemLogData {
    systemLogId: string;
    timestamp: string;
}

export function getSystemLogStore() {
    return getKeyValueStore<SystemLog>(SYSTEM_LOG_STORE_NAME);
}

export async function log(document: SystemLogData) {
    const store = getSystemLogStore();
    const systemLogId = v4();
    await store.set(systemLogId, {
        ...document,
        timestamp: document.timestamp ?? new Date().toISOString(),
        systemLogId
    });
    return systemLogId
}