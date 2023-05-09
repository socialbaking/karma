
export interface PartnerData extends Record<string, unknown> {
    partnerName: string;
    countryCode?: string; // "NZL"
    location?: string;
    remote?: boolean;
    onsite?: boolean;
    approved?: boolean;
    pharmacy?: boolean;
    delivery?: boolean;
    clinic?: boolean;
    website?: string;
}

export interface Partner extends PartnerData {
    partnerId: string;
    accessToken?: string;
    createdAt: string;
    updatedAt: string;
    approvedAt?: string;
    approvedByUserId?: string;
}