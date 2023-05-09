export const productSizeData = {
    type: "object",
    properties: {
        value: {
            type: "string"
        },
        unit: {
            type: "string"
        }
    },
    required: [
        "value",
        "unit"
    ]
}

export const productData = {
    type: "object",
    properties: {
        productName: {
            type: "string"
        },
        countryCode: {
            type: "string",
            nullable: true
        },
        licencedPartnerId: {
            type: "string",
            nullable: true
        },
        licenceApprovedBeforeGivenDate: {
            type: "boolean",
            nullable: true
        },
        licenceApprovedAt: {
            type: "string",
            nullable: true
        },
        licenceExpiredAt: {
            type: "string",
            nullable: true
        },
        // ISO 3166-1 alpha-3 country code
        licenceCountryCode: {
            type: "string",
            nullable: true
        },
        // Flag for products we don't have the exact availability date for
        availableBeforeGivenDate: {
            type: "boolean",
            nullable: true
        },
        availableAt: {
            type: "string",
            nullable: true
        },
        // For products that we will no longer have available
        availableUntil: {
            type: "string",
            nullable: true
        },
        sizes: {
            type: "array",
            items: productSizeData,
            nullable: true
        },
        // Direct text about the active ingredients, not specific values
        activeIngredientDescriptions: {
            type: "array",
            items: {
                type: "string"
            },
            nullable: true
        },
        categoryId: {
            type: "string",
            nullable: true
        },
    },
    required: [
        "productName"
    ]
} as const;

export const productActiveIngredient = {
    type: "object",
    properties: {
        type: {
            type: "string"
        },
        unit: {
            type: "string"
        },
        value: {
            type: "string"
        },
        prefix: {
            type: "string",
            nullable: true
        },
        calculated: {
            type: "boolean",
            nullable: true
        },
        calculatedUnit: {
            type: "string",
            nullable: true
        },
        size: {
            ...productSizeData,
            nullable: true
        }
    },
    required: [
        "type",
        "unit",
        "value"
    ]
} as const;

export const product = {
    type: "object",
    properties: {
        productId: {
            type: "string"
        },
        createdAt: {
            type: "string"
        },
        updatedAt: {
            type: "string"
        },
        ...productData.properties,
        activeIngredients: {
            type: "array",
            items: productActiveIngredient,
            nullable: true
        }
    },
    required: [
        "productId",
        "createdAt",
        "updatedAt",
        ...productData.required,
    ]
} as const