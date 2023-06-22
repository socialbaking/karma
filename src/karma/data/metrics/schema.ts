import { calculationConsent, reportDateData } from "../report/schema";
import { productSizeData } from "../product/schema";

export const activeIngredientMetrics = {
  type: "object",
  properties: {
    type: {
      type: "string",
    },
    unit: {
      type: "string",
    },
    value: {
      type: "string",
    },
    proportional: {
      type: "boolean",
      nullable: true,
    },
    mean: {
      type: "boolean",
      nullable: true,
    },
    size: {
      ...productSizeData,
      nullable: true,
    },
    prefix: {
      type: "string",
      nullable: true,
    },
    calculation: {
      type: "string",
      nullable: true,
    },
  },
  required: ["type", "unit", "value"],
} as const;

export const productMetricData = {
  type: "object",
  properties: {
    productId: {
      type: "string",
    },
    activeIngredients: {
      type: "array",
      items: activeIngredientMetrics,
    },
  },
  required: ["productId", "activeIngredients"],
} as const;

export const metricData = {
  type: "object",
  properties: {
    ...calculationConsent.properties,
    ...reportDateData.properties,
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
    products: {
      type: "array",
      items: productMetricData,
    },
    expiresAt: {
      type: "string",
      nullable: true,
    },
    anonymous: {
      type: "boolean",
      nullable: true,
    },
  },
  required: ["products", "countryCode"],
} as const;

export const reportMetricData = {
  type: "object",
  properties: {
    ...metricData.properties,
    parentReportId: {
      type: "string",
      nullable: true,
    },
  },
  required: [...metricData.required],
} as const;

export const reportMetrics = {
  type: "object",
  properties: {
    ...reportMetricData.properties,
    metricsId: {
      type: "string",
    },
    reportId: {
      type: "string",
    },
    reportedAt: {
      type: "string",
    },
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
  },
  required: [
    ...reportMetricData.required,
    "reportId",
    "metricsId",
    "reportedAt",
    "createdAt",
    "updatedAt",
  ],
} as const;

export const countryMetrics = {
  type: "object",
  properties: {
    ...metricData.properties,
    metricsId: {
      type: "string",
    },
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
    duration: {
      type: "string",
    },
    reportingDateKey: {
      type: "string",
    },
    expiresAt: {
      type: "string",
      nullable: true,
    },
    currencySymbol: {
      type: "string",
    },
    timezone: {
      type: "string",
    },
  },
  required: [
    ...metricData.required,
    "metricsId",
    "createdAt",
    "updatedAt",
    "duration",
    "timezone",
    "reportingDateKey",
    "currencySymbol",
  ],
} as const;
