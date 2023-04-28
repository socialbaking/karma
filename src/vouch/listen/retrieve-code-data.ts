import {FastifyInstance, FastifyRequest} from "fastify";
import {FromSchema} from "json-schema-to-ts";
import {retrieveCodeData} from "../data";

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

    const schema = {
        description: "Retrieve private code data",
        tags: ["partner"],
        summary: "",
        querystring,
        response
    };

    fastify.get(
        "/retrieve-code-data",
        {
            schema,
            async handler(request: FastifyRequest<{ Querystring: FromSchema<typeof querystring> }>, response) {
                const { uniqueCode } = request.query;

                const data = await retrieveCodeData({
                    partnerId: "1234",
                    uniqueCode
                })

                if (!data) {
                    response.status(404);
                }

                response.send(data);
            }
        }
    );
}

