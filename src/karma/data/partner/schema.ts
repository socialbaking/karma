export const partnerData = {
    type: "object",
    properties: {
        partnerName: {
            type: "string"
        },
        countryCode: {
            type: "string",
            nullable: true
        },
        location: {
            type: "string",
            nullable: true
        },
        remote: {
            type: "boolean",
            nullable: true
        },
        onsite: {
            type: "boolean",
            nullable: true
        },
        pharmacy: {
            type: "boolean",
            nullable: true
        },
        delivery: {
            type: "boolean",
            nullable: true
        },
        clinic: {
            type: "boolean",
            nullable: true
        },
        website: {
            type: "string",
            nullable: true
        }
    },
    required: [
        "partnerName"
    ]
} as const;

export const partner = {
    type: "object",
    properties: {
        partnerId: {
            type: "string"
        },
        ...partnerData.properties,
        accessToken: {
            type: "string",
            nullable: true
        },
        createdAt: {
            type: "string"
        },
        updatedAt: {
            type: "string"
        },
        approved: {
            type: "boolean",
            nullable: true
        },
        approvedAt: {
            type: "string",
            nullable: true
        },
        approvedByUserId: {
            type: "string",
            nullable: true
        }
    },
    required: [
        ...partnerData.required,
        "partnerId",
        "createdAt",
        "updatedAt"
    ]
} as const;