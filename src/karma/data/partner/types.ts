
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