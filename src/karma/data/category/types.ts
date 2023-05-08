
export interface CategoryData {
    categoryName: string;
    location: string;
    remote: boolean;
    onsite: boolean;
    clinic: boolean;
    pharmacy: boolean;
    categoryDescription: string;
}

export interface Category extends CategoryData {
    categoryId: string;
    createdAt: string;
}