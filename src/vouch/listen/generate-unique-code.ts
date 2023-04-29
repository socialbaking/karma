import {FastifyInstance} from "fastify";
import {FromSchema} from "json-schema-to-ts";
import {ok} from "../../is";
import {generateUniqueCode} from "../data";

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
    function assert(body: unknown): asserts body is BodySchema {
        ok(body);
    }

    fastify.post(
        "/generate-unique-code",
        {
            schema: {
                description: "Generate a unique code",
                tags: ["partner"],
                summary: "",
                body
            }
        },
        async (request, response) => {
            assert(request.body);

            const {
                value,
                partnerId
            } = request.body;

            response.send(
                await generateUniqueCode({
                    partnerId,
                    value
                })
            );
        }
    );
}
