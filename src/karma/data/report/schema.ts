import {productSizeData} from "../product/schema";

export const calculationConsentItem = {
    type: "object",
    properties: {
        calculationKey: {
            type: "string"
        },
        // One of these can be provided, if neither, not consented
        consented: {
            type: "boolean",
            nullable: true
        },
        consentedAt: {
            type: "string",
            nullable: true
        }
    },
    additionalProperties: true,
    required: [
        "calculationKey"
    ]
}

export const calculationConsent = {
    type: "object",
    properties: {
        calculationConsent: {
            type: "array",
            items: calculationConsentItem,
            nullable: true
        }
    }
}

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
        ...calculationConsent.properties,
        ...reportDateData.properties,
        countryCode: {
            type: "string"
        },
        currencySymbol: {
            type: "string",
            nullable: true
        },
        timezone: {
            type: "string",
            nullable: true
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
            anyOf: [
                {
                    type: "string",
                    nullable: true
                },
                {
                    type: "number",
                    nullable: true
                }
            ]
        },
        productPurchaseItems: {
            anyOf: [
                {
                    type: "string",
                    nullable: true
                },
                {
                    type: "number",
                    nullable: true
                }
            ]
        },
        productPurchaseItemCost: {
            anyOf: [
                {
                    type: "string",
                    nullable: true
                },
                {
                    type: "number",
                    nullable: true
                }
            ]
        },
        productPurchaseDeliveryCost: {
            anyOf: [
                {
                    type: "string",
                    nullable: true
                },
                {
                    type: "number",
                    nullable: true
                }
            ]
        },
        productPurchaseFeeCost: {
            anyOf: [
                {
                    type: "string",
                    nullable: true
                },
                {
                    type: "number",
                    nullable: true
                }
            ]
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