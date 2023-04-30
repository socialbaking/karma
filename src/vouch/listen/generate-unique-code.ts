import {FastifyInstance} from "fastify";
import {FromSchema} from "json-schema-to-ts";
import {ok} from "../../is";
import {generateUniqueCode} from "../data";
import {accessToken, validateAuthorizedForPartnerId} from "./authentication";

export async function generateUniqueCodeRoutes(fastify: FastifyInstance) {
    const body = {
        type: "object",
        properties: {
            value: {
                type: "number"
            },
            partnerId: {
                type: "string"
            }
        },
        required: [
            "value"
        ]
    } as const;
    type BodySchema = FromSchema<typeof body>
    type Schema = {
        Body: BodySchema
    };

    const schema = {
        description: "Generate a unique code",
        tags: ["partner"],
        summary: "",
        body,
        security: [
            {
                apiKey: [] as string[]
            }
        ]
    };

    fastify.post<Schema>(
        "/generate-unique-code",
        {
            schema,
            preHandler: fastify.auth([
               fastify.verifyBearerAuth,
                accessToken
            ]),
            async handler(request, response) {

                const {
                    value,
                    partnerId
                } = request.body;

                validateAuthorizedForPartnerId(partnerId);

                response.send(
                    await generateUniqueCode({
                        partnerId,
                        value
                    })
                );
            }
        }
    );
}
