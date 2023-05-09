import {getCategoryStore, Category, CategoryData, KeyValueStore} from "./data";
import {v5} from "uuid";

const firstSeedingDate = new Date(1683589864494).toISOString();
const createdAt = firstSeedingDate;
const updatedAt = new Date().toISOString()

// Stable uuid namespace
const namespace = "536165e4-aa2a-4d17-ad7e-751251497a11";

async function seedCategories() {
    const categoryStore = getCategoryStore();
    const categories: CategoryData[] = [
        {
            categoryName: "Flower"
        },
        {
            categoryName: "Oil"
        },
        {
            categoryName: "Equipment"
        },
        {
            categoryName: "Product"
        },
        {
            categoryName: "Fee"
        }
    ];

    async function putCategory(data: CategoryData) {
        const { categoryName } = data;
        const categoryId = v5(categoryName, namespace);
        const existing = await categoryStore.get(categoryId);
        if (existing && !isChange(data, existing)) {
            return;
        }
        const category: Category = {
            ...existing,
            ...data,
            categoryId,
            createdAt,
            updatedAt
        };
        await categoryStore.set(categoryId, category);
    }

    await Promise.all(
        categories.map(putCategory)
    );

}

export async function seed() {
    await seedCategories();
}

function isChange(left: Record<string, unknown>, right: Record<string, unknown>) {
    return !Object.entries(left).every(([key, value]) => right[key] === value);
}
