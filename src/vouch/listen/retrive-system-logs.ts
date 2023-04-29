import {FastifyInstance} from "fastify";
import {retrieveSystemLogs} from "../data";

export async function retrieveSystemLogsRoutes(fastify: FastifyInstance) {

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

    fastify.get(
        "/system-logs",
        {
            schema: {
                description: "Retrieve system logs",
                tags: ["partner"],
                summary: "",
                response
            }
        },
        async (request, response) => {
            const data = await retrieveSystemLogs({

            })

            response.send(data);
        }
    );
}

