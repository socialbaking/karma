import {getKeyValueStore} from "./kv";

const PARTNER_STORE_NAME = "partner" as const;

export interface PartnerData {
    partnerName: string;
    location: string;
    remote?: boolean;
    onsite?: boolean;
    approved?: boolean;
}

export interface Partner extends PartnerData, Record<string, unknown> {
    partnerId: string;
    accessToken?: string;
    createdAt: string;
    approvedAt?: string;
    approvedByUserId?: string;
}

export function getPartnerStore() {
    return getKeyValueStore<Partner>(PARTNER_STORE_NAME);
}