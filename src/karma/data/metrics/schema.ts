import {reportDateData} from "../report/schema";
import {productSizeData} from "../product/schema";

export const activeIngredientMetrics = {
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
        proportional: {
            type: "boolean",
            nullable: true
        },
        mean: {
            type: "boolean",
            nullable: true
        },
        size: {
            ...productSizeData,
            nullable: true
        },
        prefix: {
            type: "string",
            nullable: true
        }
    },
    required: [
        "type",
        "unit",
        "value"
    ]
} as const

export const productMetricData = {
    type: "object",
    properties: {
        productId: {
            type: "string"
        },
        activeIngredients: {
            type: "array",
            items: activeIngredientMetrics
        }
    },
    required: [
        "productId",
        "activeIngredients"
    ]
} as const;

export const metricData = {
    type: "object",
    properties: {
        ...reportDateData.properties,
        products: {
            type: "array",
            items: productMetricData
        }
    },
    required: [
        "products"
    ]
} as const;

export const reportMetrics = {
    type: "object",
    properties: {
        ...metricData.properties,
        reportId: {
            type: "string"
        },
        countryCode: {
            type: "string"
        },
        reportedAt: {
            type: "string"
        },
        createdAt: {
            type: "string"
        },
        updatedAt: {
            type: "string"
        },
        expiresAt: {
            type: "string",
            nullable: true
        }
    },
    required: [
        ...metricData.required,
        "reportId",
        "countryCode",
        "reportedAt",
        "createdAt",
        "updatedAt"
    ]
} as const;

export const countryMetrics = {
    type: "object",
    properties: {
        ...metricData.properties,
        createdAt: {
            type: "string"
        },
        updatedAt: {
            type: "string"
        },
        countryCode: {
            type: "string"
        },
        duration: {
            type: "string"
        },
        timezone: {
            type: "string"
        },
        reportingDateKey: {
            type: "string"
        },
        expiresAt: {
            type: "string",
            nullable: true
        }
    },
    required: [
        ...metricData.required,
        "createdAt",
        "updatedAt",
        "countryCode",
        "duration",
        "timezone",
        "reportingDateKey"
    ]
} as const;

