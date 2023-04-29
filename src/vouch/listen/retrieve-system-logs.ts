import {FastifyInstance, FastifyRequest} from "fastify";
import {retrieveSystemLogs} from "../data";
import {FromSchema} from "json-schema-to-ts";

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
        querystring
    }

    fastify.get(
        "/system-logs",
        {
            schema,
            async handler(request: FastifyRequest<{ Querystring: FromSchema<typeof querystring> }>, response) {
                const { partnerId } = request.query;
                const data = await retrieveSystemLogs({
                    partnerId
                })

                response.send(data);
            }
        },

    );
}

