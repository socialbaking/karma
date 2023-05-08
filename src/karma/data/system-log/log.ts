import {v4} from "uuid";
import {SystemLogData} from "./types";
import {getSystemLogStore} from "./store";

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