export interface Partner {
    partnerId: string;
    partnerName: string;
    location: string;
    onsite?: boolean;
    remote?: boolean;
}

export interface UniqueCode {
    uniqueCode: string;
    value: number;
    partnerId: string;
}

export type PublicUniqueCode = UniqueCode

export interface SystemLog extends Record<string, unknown> {
    message: string;
    uniqueCode?: string;
    value?: number;
    partnerId?: string;
    action?: string;
}

export interface VouchClient {
    generateUniqueCode(value: number): Promise<string>;
    verifyUniqueCode(uniqueCode: string, value?: number): Promise<boolean>;
    addPartner(partnerName: string, location: string, remote?: boolean, onsite?: boolean): Promise<string>;
    assignUniqueCode(uniqueCode: string, value: number, partnerId: string): Promise<void>;
    processPayment(uniqueCode: string): Promise<void>;
    acceptUniqueCode(uniqueCode: string, value: number): Promise<void>;
    getUniqueCode(uniqueCode: string): Promise<UniqueCode>;
    getPublicUniqueCode(uniqueCode: string): Promise<PublicUniqueCode>;
    listUniqueCodes(): Promise<UniqueCode[]>;
    listPartners(): Promise<Partner[]>;
    listSystemLogs(): Promise<SystemLog[]>;
}