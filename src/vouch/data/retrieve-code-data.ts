import {getUniqueCodeStore} from "./unique-code";
import {getPartnerStore} from "./partner";

export interface RetrieveCodeDataInput {
    uniqueCode: string
}

export interface RetrieveCodeDataOutput {
    uniqueCode: string
    partnerId: string
    value: number
    partnerName: string;
    location: string;
    remote?: boolean;
    onsite?: boolean;
}

export async function retrieveCodeData({ uniqueCode }: RetrieveCodeDataInput): Promise<RetrieveCodeDataOutput> {
    const store = getUniqueCodeStore();
    const document = await store.get(uniqueCode);
    if (!document) return undefined;
    const partnerStore = getPartnerStore();
    const partner = await partnerStore.get(document.partnerId)
    if (!partner) return undefined;
    return {
        ...partner,
        uniqueCode,
        value: document.value,
    }
}