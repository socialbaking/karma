import {getCategoryStore} from "./store";
import {Category, CategoryData} from "./types"
import {v4} from "uuid";


export async function addCategory({  categoryName, order }: CategoryData): Promise<Category> {
    const store = getCategoryStore();
    const categoryId = v4();
    const createdAt = new Date().toISOString();
    const category: Category = {
        categoryId,
        categoryName,
        createdAt,
        updatedAt: createdAt,
        order
    };
    await store.set(categoryId, category);
    return category;
}