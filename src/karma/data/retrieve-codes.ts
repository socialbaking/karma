import {getUniqueCodeStore} from "./unique-code";
import {RetrieveCodeDataOutput} from "./retrieve-code-data";

export async function retrieveCodes(partnerId: string): Promise<RetrieveCodeDataOutput[]> {
    const store = getUniqueCodeStore();
    const codes = await store.values();
    return codes.filter(code => code.partnerId === partnerId)
}