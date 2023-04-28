import {FastifyInstance} from "fastify";
import {FromSchema} from "json-schema-to-ts";
import {ok} from "../../is";
import {acceptUniqueCode} from "../data";

export async function verifyCodeValidityRoutes(fastify: FastifyInstance) {
    const body = {
        type: "object",
        properties: {
            uniqueCode: {
                type: "string"
            }
        },
        required: [
            "uniqueCode"
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
                uniqueCode
            } = request.body;

            response.send({
                success: await acceptUniqueCode({
                    uniqueCode,
                    partnerId: "1234"
                })
            });
        }
    )
}

