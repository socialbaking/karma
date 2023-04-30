import {FastifyInstance} from "fastify";
import {FromSchema} from "json-schema-to-ts";
import {ok} from "../../is";
import {verifyUniqueCode} from "../data";
import {validateAuthorizedForPartnerId} from "./authentication";

export async function verifyCodeValidityRoutes(fastify: FastifyInstance) {
    const body = {
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
            "partnerId"
        ]
    } as const;
    type BodySchema = FromSchema<typeof body>

    const schema = {
        description: "Verify a unique code",
        tags: ["partner"],
        summary: "",
        body,
        security: [
            {
                apiKey: [] as string[]
            }
        ]
    };
    type Schema = {
        Body: BodySchema
    }

    fastify.post<Schema>(
        "/verify-unique-code",
        {
            schema,
            preHandler: fastify.auth([
               fastify.verifyBearerAuth
            ]),
            async handler(request, response) {
                const {
                    uniqueCode,
                    partnerId,
                    value
                } = request.body;

                validateAuthorizedForPartnerId(partnerId);

                response.send({
                    success: await verifyUniqueCode({
                        uniqueCode,
                        partnerId,
                        value
                    })
                });
            }
        }
    )
}

