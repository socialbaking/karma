import {getUniqueCodeStore} from "./unique-code";
import {getPartnerStore} from "./partner";

export interface RetrieveCodePublicDetailsInput {
    uniqueCode: string
}

export interface RetrieveCodePublicDetailsOutput {
    uniqueCode: string
    partnerId: string
    value: number
}

export async function retrieveCodePublicDetails({ uniqueCode }: RetrieveCodePublicDetailsInput): Promise<RetrieveCodePublicDetailsOutput | undefined> {
    const store = getUniqueCodeStore();
    return store.get(uniqueCode);
}