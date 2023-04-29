import {FastifyInstance, FastifyRequest} from "fastify";
import {retrieveCodePublicDetails} from "../data";
import {FromSchema} from "json-schema-to-ts";

export async function retrieveCodeDetailsRoutes(fastify: FastifyInstance) {

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
            description: "Public unique code data",
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
            },
            required: [
                "uniqueCode",
                "partnerId",
                "value",
                "partnerName"
            ]
        }
    }

    const schema = {
        description: "Retrieve public code data",
        tags: ["patient"],
        summary: "",
        querystring,
        response
    }

    fastify.get(
        "/retrieve-code-details",
        {
            schema,
            async handler(request: FastifyRequest<{ Querystring: FromSchema<typeof querystring> }>, response) {
                const { uniqueCode } = request.query;

                const data = await retrieveCodePublicDetails({
                    uniqueCode
                })

                console.log({
                    uniqueCode,
                    data
                })

                if (!data) {
                    response.status(404);
                }

                response.send(data);
            }
        }
    );
}

