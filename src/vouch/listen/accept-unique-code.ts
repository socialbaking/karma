import {FastifyInstance} from "fastify";
import {acceptUniqueCode} from "../data";
import {FromSchema} from "json-schema-to-ts";
import {ok} from "../../is";
import {accessToken, allowAnonymous} from "./bearer-authentication";
import {validateAuthorizedForPartnerId} from "./authentication";

export async function acceptUniqueCodeRoutes(fastify: FastifyInstance) {

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
            "partnerId",
            "value"
        ]
    } as const;
    type BodySchema = FromSchema<typeof body>
    const schema = {
        description: "Accept a unique code",
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
        "/accept-unique-code",
        {
            schema,
            preHandler: fastify.auth([
                fastify.verifyBearerAuth,
                accessToken
            ]),
            async handler(request, response) {
                const {
                    uniqueCode,
                    partnerId,
                    value
                } = request.body;

                validateAuthorizedForPartnerId(partnerId);

                response.send({
                    success: await acceptUniqueCode({
                        uniqueCode,
                        partnerId,
                        value
                    })
                });
            }
        }
    )

}

