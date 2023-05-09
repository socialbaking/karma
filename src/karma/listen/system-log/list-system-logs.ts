import {FastifyInstance} from "fastify";
import {listSystemLogs, systemLogSchema} from "../../data";
import {FromSchema} from "json-schema-to-ts";
import {authenticate, getMaybeAuthorizedForPartnerId} from "../authentication";

export async function listSystemLogsRoutes(fastify: FastifyInstance) {

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
                ...systemLogSchema.systemLog,
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
        "/",
        {
            schema,
            preHandler: authenticate(fastify, {
                anonymous: true
            }),
            async handler(request, response) {
                const { partnerId } = request.query;
                const data = await listSystemLogs({
                    partnerId: partnerId ?? getMaybeAuthorizedForPartnerId()
                })

                response.send(data);
            }
        },

    );
}

