import {getCategoryStore, Category} from "./Category";
import {v4} from "uuid";

export interface AddCategoryInput {
    CategoryName: string;
    location: string;
    remote?: boolean;
    onsite?: boolean;
}

export async function addCategory({ CategoryName, location, remote, onsite }: AddCategoryInput): Promise<Category> {
    const store = getCategoryStore();
    const CategoryId = v4();
    const Category: Category = {
        CategoryId,
        CategoryName,
        location,
        onsite,
        remote,
        approved: false,
        createdAt: new Date().toISOString()
    };
    await store.set(CategoryId, Category)
    const { accessToken } = await createCategoryAccessToken(CategoryId);
    return {
        ...Category,
        accessToken
    };
}