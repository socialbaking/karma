import {Partner} from "./types";
import {getPartnerStore} from "./store";

export interface ListPartnersInput {
    authorizedPartnerId?: string;
}

export async function listPartners({ authorizedPartnerId }: ListPartnersInput = {}): Promise<Partner[]> {
    const store = getPartnerStore();
    const partners = await store.values();
    return partners.filter(partner => partner.approvedAt || partner.partnerId === authorizedPartnerId);
}