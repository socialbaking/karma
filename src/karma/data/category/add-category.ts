import {getCategoryStore} from "./store";
import {Category, CategoryData} from "./types"
import {v4} from "uuid";


export async function addCategory({  categoryName }: CategoryData): Promise<Category> {
    const store = getCategoryStore();
    const categoryId = v4();
    const category: Category = {
        categoryId,
        categoryName,
        createdAt: new Date().toISOString()
    };
    await store.set(categoryId, category);
    return category;
}