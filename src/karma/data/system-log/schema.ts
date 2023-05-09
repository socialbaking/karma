export const systemLogData = {
    type: "object",
    properties: {
        uniqueCode: {
            type: "string",
            nullable: true
        },
        value: {
            type: "string",
            nullable: true
        },
        action: {
            type: "string",
            nullable: true
        },
        partnerId: {
            type: "string",
            nullable: true
        },
        message: {
            type: "string"
        },
    },
    required: [
        "message"
    ]
} as const;

export const systemLog = {
    type: "object",
    properties: {
        systemLogId: {
            type: "string"
        },
        ...systemLogData.properties,
        timestamp: {
            type: "string"
        }
    },
    required: [
        ...systemLogData.required,
        "systemLogId",
        "timestamp"
    ]
} as const;