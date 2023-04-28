import {getUniqueCodeStore} from "./unique-code";
import {getPartnerStore} from "./partner";

export interface RetrieveCodePublicDetailsInput {
    uniqueCode: string
}

export interface RetrieveCodePublicDetailsOutput {
    uniqueCode: string
    partnerId: string
    value: number
    partnerName: string;
}

export async function retrieveCodePublicDetails({ uniqueCode }: RetrieveCodePublicDetailsInput): Promise<RetrieveCodePublicDetailsOutput | undefined> {
    const store = getUniqueCodeStore();
    const document = await store.get(uniqueCode);
    if (!document) return undefined;
    const partnerStore = getPartnerStore();
    const partner = await partnerStore.get(document.partnerId)
    if (!partner) return undefined;
    return {
        uniqueCode,
        value: document.value,
        partnerId: document.partnerId,
        partnerName: partner.partnerName,
    }
}