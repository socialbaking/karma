import {getCategoryStore} from "./store";
import {Category, CategoryData} from "./types"
import {v4} from "uuid";


export async function addCategory({  categoryName }: CategoryData): Promise<Category> {
    const store = getCategoryStore();
    const categoryId = v4();
    const createdAt = new Date().toISOString();
    const category: Category = {
        categoryId,
        categoryName,
        createdAt,
        updatedAt: createdAt
    };
    await store.set(categoryId, category);
    return category;
}