import id from "human-readable-ids";
import {getUniqueCodeStore, UniqueCode} from "./unique-code";
import {log} from "./system-log";

function generateActualCode() {
    return id.hri.random();
}

export interface GenerateUniqueCodeInput {
    partnerId: string
    value: number
}

export interface GenerateUniqueCodeOutput extends GenerateUniqueCodeInput {
    uniqueCode: string
}

export async function generateUniqueCode({ partnerId, value }: GenerateUniqueCodeInput): Promise<GenerateUniqueCodeOutput> {
    const uniqueCode = generateActualCode();
    const store = getUniqueCodeStore();
    const document: UniqueCode = {
        partnerId,
        value,
        uniqueCode,
        createdAt: new Date().toISOString(),
        createdBy: partnerId
    };
    await store.set(uniqueCode, document);
    await log({
        uniqueCode,
        message: "Unique code generated",
        partnerId
    })
    return document;
}