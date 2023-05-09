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

export interface CategoryData {
    categoryName: string;
}

export interface Category extends CategoryData {
    categoryId: string;
}