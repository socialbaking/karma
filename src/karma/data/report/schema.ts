import { productSizeData } from "../product/schema";

export const calculationConsentItem = {
  type: "object",
  properties: {
    calculationKey: {
      type: "string",
    },
    // One of these can be provided, if neither, not consented
    consented: {
      type: "boolean",
      nullable: true,
    },
    consentedAt: {
      type: "string",
      nullable: true,
    },
  },
  additionalProperties: true,
  required: ["calculationKey"],
};

export const calculationConsent = {
  type: "object",
  properties: {
    calculationConsent: {
      type: "array",
      items: calculationConsentItem,
      nullable: true,
    },
  },
};

export const reportDateData = {
  type: "object",
  properties: {
    orderedAt: {
      type: "string",
      nullable: true,
    },
    shippedAt: {
      type: "string",
      nullable: true,
    },
    receivedAt: {
      type: "string",
      nullable: true,
    },
    expiresAt: {
      type: "string",
      nullable: true,
    },
    createdAt: {
      type: "string",
      nullable: true,
    },
    updatedAt: {
      type: "string",
      nullable: true,
    },
  },
} as const;

export const reportDataReportKeys: (keyof typeof reportData.properties)[] = [
  "type",
  "countryCode",
  "currencySymbol",
  "timezone",
  "note",
  "productText",
  "productSize",
  "productTotalCost",
  "productItemCost",
  "productItems",
  "productDeliveryCost",
  "productFeeCost",
  "productOrganisationText",
];

export const reportData = {
  type: "object",
  properties: {
    ...calculationConsent.properties,
    ...reportDateData.properties,
    type: {
      type: "string",
    },
    countryCode: {
      type: "string",
    },
    currencySymbol: {
      type: "string",
      nullable: true,
    },
    timezone: {
      type: "string",
      nullable: true,
    },
    note: {
      type: "string",
      nullable: true,
    },
    parentReportId: {
      type: "string",
      nullable: true,
    },
    productId: {
      type: "string",
      nullable: true,
    },
    productName: {
      type: "string",
      nullable: true,
    },
    productText: {
      type: "string",
      nullable: true,
    },
    productSize: {
      ...productSizeData,
      nullable: true,
    },
    createdByUserId: {
      type: "string",
      nullable: true,
    },
    anonymous: {
      type: "boolean",
      nullable: true,
    },
    productTotalCost: {
      anyOf: [
        {
          type: "string",
          nullable: true,
        },
        {
          type: "number",
          nullable: true,
        },
      ],
    },
    productItems: {
      anyOf: [
        {
          type: "string",
          nullable: true,
        },
        {
          type: "number",
          nullable: true,
        },
      ],
    },
    productItemCost: {
      anyOf: [
        {
          type: "string",
          nullable: true,
        },
        {
          type: "number",
          nullable: true,
        },
      ],
    },
    productDeliveryCost: {
      anyOf: [
        {
          type: "string",
          nullable: true,
        },
        {
          type: "number",
          nullable: true,
        },
      ],
    },
    productFeeCost: {
      anyOf: [
        {
          type: "string",
          nullable: true,
        },
        {
          type: "number",
          nullable: true,
        },
      ],
    },
    productOrganisationId: {
      type: "string",
      nullable: true,
    },
    productOrganisationName: {
      type: "string",
      nullable: true,
    },
    productOrganisationText: {
      type: "string",
      nullable: true,
    },

    // TODO No longer used fields, but keeping around until v1.0.0
    productPurchase: {
      type: "boolean",
      nullable: true,
      deprecated: true,
    },
    productPurchaseTotalCost: {
      anyOf: [
        {
          type: "string",
          nullable: true,
          deprecated: true,
        },
        {
          type: "number",
          nullable: true,
          deprecated: true,
        },
      ],
    },
    productPurchaseItems: {
      anyOf: [
        {
          type: "string",
          nullable: true,
          deprecated: true,
        },
        {
          type: "number",
          nullable: true,
          deprecated: true,
        },
      ],
    },
    productPurchaseItemCost: {
      anyOf: [
        {
          type: "string",
          nullable: true,
          deprecated: true,
        },
        {
          type: "number",
          nullable: true,
          deprecated: true,
        },
      ],
    },
    productPurchaseDeliveryCost: {
      anyOf: [
        {
          type: "string",
          nullable: true,
          deprecated: true,
        },
        {
          type: "number",
          nullable: true,
          deprecated: true,
        },
      ],
    },
    productPurchaseFeeCost: {
      anyOf: [
        {
          type: "string",
          nullable: true,
          deprecated: true,
        },
        {
          type: "number",
          nullable: true,
          deprecated: true,
        },
      ],
    },
    productPurchaseOrganisationId: {
      type: "string",
      nullable: true,
      deprecated: true,
    },
    productPurchaseOrganisationName: {
      type: "string",
      nullable: true,
      deprecated: true,
    },
    productPurchaseOrganisationText: {
      type: "string",
      nullable: true,
      deprecated: true,
    },
  },
  required: ["countryCode", "type"],
} as const;

export const report = {
  type: "object",
  properties: {
    ...reportData.properties,
    reportId: {
      type: "string",
    },
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
    reportedAt: {
      type: "string",
    },
  },
  required: [
    ...reportData.required,
    "reportId",
    "createdAt",
    "updatedAt",
    "reportedAt",
  ],
} as const;
