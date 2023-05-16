export const organisationBaseData = {
    type: "object",
    properties: {
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
    }
}

export const organisationData = {
    type: "object",
    properties: {
        ...organisationBaseData.properties,
        organisationName: {
            type: "string"
        }
    },
    required: [
        "organisationName"
    ]
} as const;

export const organisation = {
    type: "object",
    properties: {
        organisationId: {
            type: "string"
        },
        ...organisationData.properties,
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
        ...organisationData.required,
        "organisationId",
        "createdAt",
        "updatedAt"
    ]
} as const;