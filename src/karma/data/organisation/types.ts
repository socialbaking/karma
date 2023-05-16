
export interface OrganisationBaseData extends Record<string, unknown> {
    countryCode?: string; // "NZ"
    location?: string;
    remote?: boolean;
    onsite?: boolean;
    pharmacy?: boolean;
    delivery?: boolean;
    clinic?: boolean;
    website?: string;
}

export interface OrganisationData extends OrganisationBaseData {
    organisationName: string;
    partnerId?: string;
    approved?: boolean;
    approvedAt?: string;
}

export interface Organisation extends OrganisationData {
    organisationId: string;
    createdAt: string;
    updatedAt: string;
    approvedByUserId?: string;
}