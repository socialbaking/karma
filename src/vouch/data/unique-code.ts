import {getKeyValueStore} from "./kv";
import {getSystemLogStore, log} from "./system-log";
import {v4} from "uuid";

interface StateHistoryItem {

}

export interface UniqueCode {
    uniqueCode: string;
    value: number;
    partnerId: string;
    acceptedAt?: string;
    acceptedBy?: string; // partnerId
}

type UniqueCodeStateType = "accepted" | "validated" | "assigned" | "processed";

const UNIQUE_CODE_STORE_NAME = "uniqueCode" as const;

export function getUniqueCodeStore() {
    return getKeyValueStore<UniqueCode>(UNIQUE_CODE_STORE_NAME)
}

export function getUniqueCode(uniqueCode: string): Promise<UniqueCode | undefined> {
    return getUniqueCodeStore().get(uniqueCode);
}

export interface UpdateUniqueCodeStateInput {
    uniqueCode: string;
    type: UniqueCodeStateType;
    partnerId: string;
}

export async function updateUniqueCodeState({
    uniqueCode,
    partnerId,
    type
}: UpdateUniqueCodeStateInput) {
    const store = getUniqueCodeStore()
    const document = await store.get(uniqueCode);
    const timestamp = new Date().toISOString();
    await log({
        partnerId,
        message: `Unique code ${type}`,
        uniqueCode
    })
    await store.set(uniqueCode, {
        ...document,
        [`${type}At`]: timestamp,
        [`${type}By`]: partnerId,
    });
}