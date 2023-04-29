import {FastifyInstance} from "fastify";
import {FromSchema} from "json-schema-to-ts";
import {ok} from "../../is";
import {verifyUniqueCode} from "../data";

export async function verifyCodeValidityRoutes(fastify: FastifyInstance) {
    const body = {
        type: "object",
        properties: {
            uniqueCode: {
                type: "string"
            },
            partnerId: {
                type: "string"
            }
        },
        required: [
            "uniqueCode",
            "partnerId"
        ]
    } as const;
    type BodySchema = FromSchema<typeof body>
    function assert(body: unknown): asserts body is BodySchema {
        ok(body);
    }

    fastify.post(
        "/verify-unique-code",
        {
            schema: {
                description: "Verify a unique code",
                tags: ["partner"],
                summary: "",
                body
            }
        },
        async (request, response) => {
            assert(request.body);

            const {
                uniqueCode,
                partnerId
            } = request.body;

            response.send({
                success: await verifyUniqueCode({
                    uniqueCode,
                    partnerId
                })
            });
        }
    )
}

