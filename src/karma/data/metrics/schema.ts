import {calculationConsent, reportDateData} from "../report/schema";
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
        ...calculationConsent.properties,
        ...reportDateData.properties,
        countryCode: {
            type: "string"
        },
        products: {
            type: "array",
            items: productMetricData
        },
        expiresAt: {
            type: "string",
            nullable: true
        },
        anonymous: {
            type: "string",
            nullable: true
        },
    },
    required: [
        "products",
        "countryCode"
    ]
} as const;

export const reportMetrics = {
    type: "object",
    properties: {
        ...metricData.properties,
        metricsId: {
            type: "string"
        },
        reportId: {
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
        }
    },
    required: [
        ...metricData.required,
        "reportId",
        "metricsId",
        "reportedAt",
        "createdAt",
        "updatedAt"
    ]
} as const;

export const countryMetrics = {
    type: "object",
    properties: {
        ...metricData.properties,
        metricsId: {
            type: "string"
        },
        createdAt: {
            type: "string"
        },
        updatedAt: {
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
        "metricsId",
        "createdAt",
        "updatedAt",
        "duration",
        "timezone",
        "reportingDateKey"
    ]
} as const;

