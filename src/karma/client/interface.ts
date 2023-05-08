export interface UniqueCode extends Record<string, unknown> {
    uniqueCode: string;
    value: number;
    partnerId: string;
}

export interface PublicUniqueCode {
    uniqueCode: string;
    value: number;
    partnerId: string;
}

export interface SystemLog extends Record<string, unknown> {
    message: string;
    uniqueCode?: string;
    value?: number;
    partnerId?: string;
    action?: string;
}

export interface PartnerData {
    partnerName: string;
    location: string;
    onsite?: boolean;
    remote?: boolean;
    clinic?: boolean;
    pharmacy?: boolean;
    partnerDescription?: string;
}

export interface Partner extends PartnerData {
    partnerId: string;
    accessToken?: string;
}

export interface ClientOptions {
    partnerId?: string;
    accessToken?: string;
    version?: number;
    prefix?: string;
    url?: string | URL;
}

export interface Client {
    addPartner(partner: PartnerData): Promise<Partner>;
    listPartners(): Promise<Partner[]>;
    listSystemLogs(): Promise<SystemLog[]>;
}