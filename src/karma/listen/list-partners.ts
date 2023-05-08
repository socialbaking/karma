import {FastifyInstance, FastifyRequest} from "fastify";
import {listPartners} from "../data";
import {accessToken, allowAnonymous} from "./bearer-authentication";

export async function listPartnerRoutes(fastify: FastifyInstance) {

    const response = {
        200: {
            type: "array",
            items: {
                description: "A partner",
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
    }

    const schema = {
        description: "Retrieve a list of private code data",
        tags: ["partner"],
        summary: "",
        response,
        security: [
            {
                apiKey: [] as string[]
            }
        ]
    };

    fastify.get(
        "/partners",
        {
            schema,
            preHandler: fastify.auth([
               allowAnonymous,
               fastify.verifyBearerAuth,
               accessToken
            ]),
            async handler(request: FastifyRequest, response) {
                response.send(
                    await listPartners()
                );
            }
        }
    );
}

