import {FastifyInstance, FastifyRequest} from "fastify";
import {retrievePartners} from "../data";
import {allowAnonymous} from "./bearer-authentication";

export async function retrievePartnerRoutes(fastify: FastifyInstance) {

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
        response
    };

    fastify.get(
        "/partners",
        {
            schema,
            preHandler: fastify.auth([
               allowAnonymous,
               fastify.verifyBearerAuth
            ]),
            async handler(request: FastifyRequest, response) {
                response.send(
                    await retrievePartners()
                );
            }
        }
    );
}

