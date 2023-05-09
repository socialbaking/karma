export const categoryData = {
    type: "object",
    properties: {
        categoryName: {
            type: "string"
        },
        countryCode: {
            type: "string",
            nullable: true
        }
    },
    required: [
        "categoryName"
    ]
} as const;

export const category = {
    type: "object",
    properties: {
        categoryId: {
            type: "string"
        },
        ...categoryData.properties,
        createdAt: {
            type: "string"
        },
        updatedAt: {
            type: "string"
        },
    },
    required: [
        ...categoryData.required,
        "categoryId",
        "createdAt",
        "updatedAt"
    ]
} as const;