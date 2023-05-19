export const formMetaData = {
  type: "object",
  properties: {},
  additionalProperties: true,
  required: [],
} as const;

export const formMeta = {
  type: "object",
  properties: {
    formMetaId: {
      type: "string",
    },
    ...formMetaData.properties,
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
  },
  required: [...formMetaData.required, "formMetaId", "createdAt", "updatedAt"],
} as const;
