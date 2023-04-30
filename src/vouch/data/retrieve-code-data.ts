import {getUniqueCodeStore} from "./unique-code";
import {getPartnerStore} from "./partner";

export interface RetrieveCodeDataInput {
    uniqueCode: string
}

export interface RetrieveCodeDataOutput {
    uniqueCode: string
    partnerId: string
    value: number
}

export async function retrieveCodeData({ uniqueCode }: RetrieveCodeDataInput): Promise<RetrieveCodeDataOutput> {
    const store = getUniqueCodeStore();
    return store.get(uniqueCode);
}