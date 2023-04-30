import {FastifyInstance, FastifyRequest} from "fastify";
import {retrieveCodePublicDetails} from "../data";
import {FromSchema} from "json-schema-to-ts";
import {allowAnonymous} from "./bearer-authentication";

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
                }
            },
            required: [
                "uniqueCode",
                "partnerId",
                "value"
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

    type Schema = {
        Querystring: FromSchema<typeof querystring>
    }

    fastify.get<Schema>(
        "/unique-code-details",
        {
            schema,
            preHandler: fastify.auth([
               allowAnonymous,
               fastify.verifyBearerAuth
            ]),
            async handler(request, response) {
                const { uniqueCode } = request.query;

                const data = await retrieveCodePublicDetails({
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

