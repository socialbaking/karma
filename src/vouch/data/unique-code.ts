import {getKeyValueStore} from "./kv";

export interface UniqueCode {
    uniqueCode: string;
    value: number;
    partnerId: string;
}

const UNIQUE_CODE_STORE_NAME = "uniqueCode" as const;

export function getUniqueCodeStore() {
    return getKeyValueStore<UniqueCode>(UNIQUE_CODE_STORE_NAME)
}