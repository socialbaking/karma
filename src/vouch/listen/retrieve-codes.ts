import {FastifyInstance, FastifyRequest} from "fastify";
import {FromSchema} from "json-schema-to-ts";
import {retrieveCodeData, retrieveCodes} from "../data";
import {accessToken, allowAnonymous} from "./bearer-authentication";
import {getAuthorizedForPartnerId} from "./authentication";

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
                    }
                },
                required: [
                    "uniqueCode",
                    "partnerId",
                    "value"
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
        "/unique-codes",
        {
            schema,
            preHandler: fastify.auth([
               allowAnonymous,
               fastify.verifyBearerAuth,
               accessToken
            ]),
            async handler(request: FastifyRequest, response) {
                response.send(
                    await retrieveCodes(
                        getAuthorizedForPartnerId()
                    )
                );
            }
        }
    );
}

