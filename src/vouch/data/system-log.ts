import {getKeyValueStore} from "./kv";

const SYSTEM_LOG_STORE_NAME = "systemLog" as const;

export interface SystemLogData {
    uniqueCode?: string;
    value?: number;
    partnerId: string;
    partnerName: string;
    message: string;
    timestamp: string;
}

export interface SystemLog extends SystemLogData {
    systemLogId: string;
}

export function getSystemLogStore() {
    return getKeyValueStore<SystemLogData>(SYSTEM_LOG_STORE_NAME);
}