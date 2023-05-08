import {FastifyInstance} from "fastify";
import {retrieveSystemLogs} from "../data";
import {FromSchema} from "json-schema-to-ts";
import {accessToken, allowAnonymous} from "./bearer-authentication";
import {getMaybeAuthorizedForPartnerId} from "./authentication";

export async function retrieveSystemLogsRoutes(fastify: FastifyInstance) {

    const querystring = {
        type: "object",
        properties: {
            partnerId: {
                type: "string"
            }
        },
        required: [
        ]
    } as const;

    const response = {
        200: {
            description: "System logs",
            type: "array",
            items: {
                type: "object",
                properties: {
                    systemLogId: {
                        type: "string"
                    },
                    message: {
                        type: "string"
                    },
                    partnerId: {
                        type: "string"
                    },
                    value: {
                        type: "number"
                    },
                    timestamp: {
                        type: "string"
                    },
                    uniqueCode: {
                        type: "string"
                    }
                },
                required: [
                    "message",
                    "timestamp"
                ],
                additionalProperties: true,
            }
        }
    };

    const schema = {
        description: "Retrieve system logs",
        tags: ["partner"],
        summary: "",
        response,
        querystring,
        security: [
            {
                apiKey: [] as string[]
            }
        ]
    }

    type Schema = {
        Querystring: FromSchema<typeof querystring>
    }

    fastify.get<Schema>(
        "/system-logs",
        {
            schema,
            preHandler: fastify.auth([
                allowAnonymous,
                fastify.verifyBearerAuth,
                accessToken
            ]),
            async handler(request, response) {
                const { partnerId } = request.query;
                const data = await retrieveSystemLogs({
                    partnerId: partnerId ?? getMaybeAuthorizedForPartnerId()
                })

                response.send(data);
            }
        },

    );
}

