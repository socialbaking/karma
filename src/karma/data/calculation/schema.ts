export const calculationSource = {
    type: "object",
    properties: {
        calculationKey: {
            type: "string"
        },
        title: {
            type: "string"
        },
        description: {
            type: "string"
        }
    },
    required: [
        "calculationKey",
        "title",
        "description"
    ]
} as const;