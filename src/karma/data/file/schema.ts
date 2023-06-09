export const fileData = {
  type: "object",
  properties: {
    fileName: {
      type: "string"
    },
    contentType: {
      type: "string"
    },
    size: {
      type: "number",
      nullable: true
    },
    url: {
      type: "string",
      nullable: true
    },
    source: {
      type: "string",
      nullable: true
    },
    synced: {
      type: "string",
      nullable: true
    },
    syncedAt: {
      type: "string",
      nullable: true
    },
    version: {
      type: "number",
      nullable: true
    },
    type: {
      type: "string",
      nullable: true
    },
  },
  additionalProperties: true,
  required: [
      "fileName",
      "contentType"
  ],
} as const;

export const file = {
  type: "object",
  properties: {
    fileId: {
      type: "string",
    },
    ...fileData.properties,
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
  },
  required: [...fileData.required, "fileId", "createdAt", "updatedAt"],
} as const;
