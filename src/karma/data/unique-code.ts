import {getKeyValueStore} from "./kv";
import {log} from "./system-log";

export interface UniqueCode {
    uniqueCode: string;
    value: number;
    partnerId: string;
    createdAt: string;
    createdBy: string;
    createdByUsername?: string;
    acceptedAt?: string;
    acceptedBy?: string; // partnerId
    acceptedValue?: number;
    assignedAt?: string;
    assignedBy?: string;
    assignedValue?: number;
    validatedAt?: string;
    validatedBy?: string;
    validatedValue?: number;
    processedAt?: string;
    processedBy?: string;
    processedValue?: number;
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
    value: number
}

export async function updateUniqueCodeState({
    uniqueCode,
    partnerId,
    type,
    value
}: UpdateUniqueCodeStateInput) {
    const store = getUniqueCodeStore()
    const document = await store.get(uniqueCode);
    const timestamp = new Date().toISOString();
    await log({
        partnerId,
        message: `Unique code ${type} (Value: ${value})`,
        uniqueCode,
        value,
        action: type
    });
    const currentValue = document[`${type}Value`] ?? 0
    await store.set(uniqueCode, {
        ...document,
        [`${type}At`]: timestamp,
        [`${type}By`]: partnerId,
        [`${type}Value`]: currentValue + value
    });
}