import {getUniqueCodeStore} from "./unique-code";
import {getPartnerStore} from "./partner";
import {RetrieveCodeDataOutput} from "./retrieve-code-data";

export async function retrieveCodes(): Promise<RetrieveCodeDataOutput[]> {
    const store = getUniqueCodeStore();
    const documents = await store.values();
    if (!documents.length) return [];
    const partnerStore = getPartnerStore();
    const partnerIds = [...new Set(documents.map(document => document.partnerId))];
    const partners = (
        await Promise.all(
            partnerIds.map(partner => partnerStore.get(partner))
        )
    )
        .filter(Boolean)
    const partnerMap = new Map(
        partners.map(
            partner => [partner.partnerId, partner]
        )
    );
    return documents
        .filter(document => partnerMap.has(document.partnerId))
        .map(document => {
            const partner = partnerMap.get(document.partnerId);
            return {
                ...partner,
                ...document
            }
        });
}