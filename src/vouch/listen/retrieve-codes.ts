import {FastifyInstance, FastifyRequest} from "fastify";
import {FromSchema} from "json-schema-to-ts";
import {retrieveCodeData, retrieveCodes} from "../data";

export async function retrieveCodesRoutes(fastify: FastifyInstance) {

    const response = {
        200: {
            type: "array",
            items: {
                description: "Private unique code data",
                type: "object",
                properties: {
                    uniqueCode: {
                        type: "string"
                    },
                    partnerId: {
                        type: "string"
                    },
                    value: {
                        type: "number"
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
                    "uniqueCode",
                    "partnerId",
                    "value",
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
        "/retrieve-codes",
        {
            schema,
            async handler(request: FastifyRequest, response) {
                response.send(
                    await retrieveCodes()
                );
            }
        }
    );
}

