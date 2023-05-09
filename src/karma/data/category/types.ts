
export interface CategoryData extends Record<string, unknown> {
    categoryName: string;
    countryCode?: string;
}

export interface Category extends CategoryData {
    categoryId: string;
    createdAt: string;
    updatedAt: string;
}