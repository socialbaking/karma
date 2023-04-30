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

export interface VouchClient {
    generateUniqueCode(value: number): Promise<string>;
    verifyUniqueCode(uniqueCode: string, value?: number): Promise<boolean>;
    addPartner(partner: PartnerData): Promise<Partner>;
    assignUniqueCode(uniqueCode: string, value: number, partnerId: string): Promise<void>;
    processPayment(uniqueCode: string): Promise<void>;
    acceptUniqueCode(uniqueCode: string, value: number): Promise<void>;
    getUniqueCode(uniqueCode: string): Promise<UniqueCode>;
    getPublicUniqueCode(uniqueCode: string): Promise<PublicUniqueCode>;
    listUniqueCodes(): Promise<UniqueCode[]>;
    listPartners(): Promise<Partner[]>;
    listSystemLogs(): Promise<SystemLog[]>;
}