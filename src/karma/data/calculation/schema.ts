export const calculationSource = {
  type: "object",
  properties: {
    calculationKey: {
      type: "string",
    },
    title: {
      type: "string",
    },
    description: {
      type: "string",
    },
    anonymous: {
      type: "boolean",
    },
  },
  required: ["calculationKey", "title", "description", "anonymous"],
} as const;
