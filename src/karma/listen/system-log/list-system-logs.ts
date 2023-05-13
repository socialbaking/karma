import {FastifyInstance} from "fastify";
import {listSystemLogs, systemLogSchema} from "../../data";
import {FromSchema} from "json-schema-to-ts";
import {authenticate} from "../authentication";
import {getMaybeAuthorizedForPartnerId} from "../../authentication";

export async function listSystemLogsRoutes(fastify: FastifyInstance) {

    const response = {
        200: {
            description: "System logs",
            type: "array",
            items: {
                ...systemLogSchema.systemLog,
                additionalProperties: true,
            }
        }
    };

    const schema = {
        description: "List of system logs",
        tags: ["system"],
        summary: "",
        response,
        security: [
            {
                apiKey: [] as string[]
            }
        ]
    }

    fastify.get(
        "/",
        {
            schema,
            preHandler: authenticate(fastify),
            async handler(request, response) {
                const data = await listSystemLogs({
                    partnerId: getMaybeAuthorizedForPartnerId()
                })

                response.send(data);
            }
        },

    );
}

