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
    partnerName: string;
    location: string;
}

export interface VouchClient {
    generateUniqueCode(value: number): Promise<string>;
    verifyUniqueCode(uniqueCode: string, value?: number): Promise<boolean>;
    addPartner(partnerName: string, location: string, remote?: boolean, onsite?: boolean): Promise<string>;
    assignUniqueCode(uniqueCode: string, value: number): Promise<void>;
    processPayment(uniqueCode: string): Promise<void>;
    acceptUniqueCode(uniqueCode: string, value: number): Promise<void>;
    getUniqueCode(uniqueCode: string): Promise<UniqueCode>;
    listUniqueCodes(): Promise<UniqueCode[]>;
    listPartners(): Promise<Partner[]>;
}