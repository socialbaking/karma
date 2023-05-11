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

export const reportMetricsData = {
    type: "object",
    properties: {
        ...reportDateData.properties,
        reportId: {
            type: "string"
        },
        productId: {
            type: "string"
        },
        countryCode: {
            type: "string"
        },
        reportedAt: {
            type: "string"
        },
        activeIngredients: {
            type: "array",
            items: activeIngredientMetrics
        }
    },
    required: [
        "reportId",
        "reportedAt",
        "activeIngredients",
        "countryCode",
        "productId"
    ]
} as const;

export const reportMetrics = {
    type: "object",
    properties: {
        ...reportDateData.properties,
        createdAt: {
            type: "string"
        },
        updatedAt: {
            type: "string"
        },
    },
    required: [
        ...reportMetricsData.required,
        "createdAt",
        "updatedAt"
    ]
} as const;

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

export const countryMetricData = {
    type: "object",
    properties: {
        products: {
            type: "array",
            items: productMetricData
        }
    },
    required: [
        "products"
    ]
} as const;

export const countryMetrics = {
    type: "object",
    properties: {
        ...countryMetricData.properties,
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
        timestamp: {
            type: "string"
        },
        timezone: {
            type: "string"
        },
    },
    required: [
        ...countryMetricData.required,
        "createdAt",
        "updatedAt",
        "countryCode",
        "duration",
        "timestamp",
        "timezone"
    ]
} as const;

