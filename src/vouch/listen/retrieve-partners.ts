import {FastifyInstance, FastifyRequest} from "fastify";
import {retrievePartners} from "../data";

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
            async handler(request: FastifyRequest, response) {
                response.send(
                    await retrievePartners()
                );
            }
        }
    );
}
