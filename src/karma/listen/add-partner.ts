import {FastifyInstance, FastifyRequest} from "fastify";
import {FromSchema} from "json-schema-to-ts";
import {addPartner} from "../data";
import {accessToken, allowAnonymous} from "./bearer-authentication";

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
            "partnerName"
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
                },
                accessToken: {
                    type: "string"
                }
            },
            required: [
                "partnerId",
                "partnerName"
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

    fastify.post<Schema>(
        "/partners",
        {
            schema,
            preHandler: fastify.auth([
                allowAnonymous,
                fastify.verifyBearerAuth,
                accessToken
            ]),
            async handler(request, response)  {
                const {
                    partnerName,
                    location,
                    onsite,
                    remote
                } = request.body;

                const partner = await addPartner({
                    partnerName,
                    location,
                    onsite,
                    remote
                });

                response.status(201);
                response.send(partner);
            }
        }
    )
}

