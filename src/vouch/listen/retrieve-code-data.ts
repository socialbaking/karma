import {FastifyInstance, FastifyRequest} from "fastify";
import {FromSchema} from "json-schema-to-ts";
import {retrieveCodeData} from "../data";
import {validateAuthorizedForPartnerId} from "./authentication";

export async function retrieveCodeDataRoutes(fastify: FastifyInstance) {

    const querystring = {
        type: "object",
        properties: {
            uniqueCode: {
                type: "string"
            }
        },
        required: [
            "uniqueCode"
        ]
    } as const;

    const response = {
        200: {
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
            additionalProperties: true,
            required: [
                "uniqueCode",
                "partnerId",
                "value"
            ]
        }
    }

    const schema = {
        description: "Retrieve private code data",
        tags: ["partner"],
        summary: "",
        querystring,
        response
    };

    type Schema = {
        Querystring: FromSchema<typeof querystring>;
    };

    fastify.get<Schema>(
        "/unique-code-data",
        {
            schema,
            preHandler: fastify.auth([
               fastify.verifyBearerAuth
            ]),
            async handler(request, response) {
                const { uniqueCode } = request.query;

                const data = await retrieveCodeData({
                    uniqueCode
                });

                validateAuthorizedForPartnerId(data.partnerId);

                if (!data) {
                    response.status(404);
                }

                response.send(data);
            }
        }
    );
}

