import {FastifyInstance} from "fastify";
import {FromSchema} from "json-schema-to-ts";
import {ok} from "../../is";
import {assignUniqueCode} from "../data";
import {validateAuthorizedForPartnerId} from "./authentication";

export async function assignUniqueCodeRoutes(fastify: FastifyInstance) {
    const body = {
        type: "object",
        properties: {
            uniqueCode: {
                type: "string"
            },
            value: {
                type: "number"
            },
            partnerId: {
                type: "string"
            }
        },
        required: [
            "uniqueCode",
            "value",
            "partnerId"
        ]
    } as const;
    type BodySchema = FromSchema<typeof body>
    function assert(body: unknown): asserts body is BodySchema {
        ok(body);
    }
    type Schema = {
        Body: BodySchema
    }
    const schema = {
        description: "Assign a unique code",
        tags: ["partner"],
        summary: "",
        body
    };

    fastify.post<Schema>(
        "/assign-unique-code",
        {
            schema,
            preHandler: fastify.auth([
               fastify.verifyBearerAuth
            ]),
            async handler(request, response) {
                const {
                    uniqueCode,
                    value,
                    partnerId
                } = request.body;

                validateAuthorizedForPartnerId(partnerId);

                response.send({
                    success: await assignUniqueCode({
                        uniqueCode,
                        partnerId,
                        value
                    })
                });
            }
        }
    );
}

