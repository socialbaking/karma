import { organisationBaseData } from "../organisation/schema";

export const partnerData = {
  type: "object",
  properties: {
    ...organisationBaseData.properties,
    partnerName: {
      type: "string",
    },
  },
  required: ["partnerName"],
} as const;

export const partner = {
  type: "object",
  properties: {
    partnerId: {
      type: "string",
    },
    organisationId: {
      type: "string",
    },
    partnerName: {
      type: "string",
    },
    countryCode: {
      type: "string",
      nullable: true,
    },
    accessToken: {
      type: "string",
      nullable: true,
    },
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
    approved: {
      type: "boolean",
      nullable: true,
    },
    approvedAt: {
      type: "string",
      nullable: true,
    },
    approvedByUserId: {
      type: "string",
      nullable: true,
    },
  },
  required: [
    "partnerName",
    "organisationId",
    "partnerId",
    "createdAt",
    "updatedAt",
  ],
} as const;
