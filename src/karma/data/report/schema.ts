import {productSizeData} from "../product/schema";

export const reportDateData = {
    type: "object",
    properties: {
        orderedAt: {
            type: "string",
            nullable: true
        },
        shippedAt: {
            type: "string",
            nullable: true
        },
        receivedAt: {
            type: "string",
            nullable: true
        },
        expiresAt: {
            type: "string",
            nullable: true
        },
        createdAt: {
            type: "string",
            nullable: true
        },
        updatedAt: {
            type: "string",
            nullable: true
        },
    }
} as const;

export const reportData = {
    type: "object",
    properties: {
        ...reportDateData.properties,
        countryCode: {
            type: "string"
        },
        note: {
            type: "string",
            nullable: true
        },
        parentReportId: {
            type: "string",
            nullable: true
        },
        productId: {
            type: "string",
            nullable: true
        },
        productName: {
            type: "string",
            nullable: true
        },
        productText: {
            type: "string",
            nullable: true
        },
        productPurchase: {
            type: "boolean",
            nullable: true
        },
        productPurchaseTotalCost: {
            type: "string",
            nullable: true
        },
        productPurchaseItems: {
            type: "string",
            nullable: true
        },
        productPurchaseItemCost: {
            type: "string",
            nullable: true
        },
        productPurchaseDeliveryCost: {
            type: "string",
            nullable: true
        },
        productPurchaseFeeCost: {
            type: "string",
            nullable: true
        },
        productPurchasePartnerId: {
            type: "string",
            nullable: true
        },
        productPurchasePartnerName: {
            type: "string",
            nullable: true
        },
        productPurchasePartnerText: {
            type: "string",
            nullable: true
        },
        productSize: {
            ...productSizeData,
            nullable: true
        },
        createdByUserId: {
            type: "string",
            nullable: true
        },
        anonymous: {
            type: "boolean",
            nullable: true
        }
    },
    required: [
        "countryCode"
    ]
} as const;

export const report = {
    type: "object",
    properties: {
        ...reportData.properties,
        reportId: {
            type: "string"
        },
        createdAt: {
            type: "string"
        },
        updatedAt: {
            type: "string"
        },
        reportedAt: {
            type: "string"
        }
    },
    required: [
        ...reportData.required,
        "reportId",
        "createdAt",
        "updatedAt",
        "reportedAt"
    ]
} as const;