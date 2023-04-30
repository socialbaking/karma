import {FastifyInstance, FastifyRequest} from "fastify";
import {FromSchema} from "json-schema-to-ts";
import {addPartner} from "../data";

export async function addPartnerRoutes(fastify: FastifyInstance) {

    const body = {
        type: "object",
        properties: {
            partnerName: {
                type: "string"
            },
            location: {
                type: "string"
            },
            remote: {
                type: "boolean"
            },
            onsite: {
                type: "boolean"
            },
            clinic: {
                type: "boolean"
            },
            pharmacy: {
                type: "boolean"
            },
            partnerDescription: {
                type: "string"
            }
        },
        required: [
            "partnerName",
            "location"
        ]
    } as const;
    type BodySchema = FromSchema<typeof body>

    type Schema = {
        Body: BodySchema
    }

    const response = {
        201: {
            description: "A new partner",
            type: "object",
            properties: {
                partnerId: {
                    type: "string"
                },
                partnerName: {
                    type: "string"
                },
                location: {
                    type: "string"
                },
                onsite: {
                    type: "boolean"
                },
                remote: {
                    type: "boolean"
                },
                clinic: {
                    type: "boolean"
                },
                pharmacy: {
                    type: "boolean"
                },
                partnerDescription: {
                    type: "string"
                }
            },
            required: [
                "partnerId",
                "partnerName",
                "location"
            ]
        }
    }

    const schema = {
        description: "Add a new partner",
        tags: ["partner"],
        summary: "",
        body,
        response
    }

    fastify.post(
        "/add-partner",
        {
            schema
        },
        async (request: FastifyRequest<Schema>, response) => {

            const {
                partnerName,
                location,
                onsite,
                remote
            } = request.body;

            const partnerId = await addPartner({
                partnerName,
                location,
                onsite,
                remote
            });

            if (!partnerId) {
                response.status(500);
                return response.send()
            } else {
                response.status(201);
            }

            response.send({
                partnerId,
                partnerName,
                location,
                onsite,
                remote
            });
        }
    )
}

