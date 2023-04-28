import {FastifyInstance} from "fastify";
import {FromSchema} from "json-schema-to-ts";
import {ok} from "../../is";
import {assignUniqueCode} from "../data";

export async function assignUniqueCodeRoutes(fastify: FastifyInstance) {
    const body = {
        type: "object",
        properties: {
            uniqueCode: {
                type: "string"
            },
            value: {
                type: "number"
            }
        },
        required: [
            "uniqueCode",
            "value"
        ]
    } as const;
    type BodySchema = FromSchema<typeof body>
    function assert(body: unknown): asserts body is BodySchema {
        ok(body);
    }

    fastify.post(
        "/assign-unique-code",
        {
            schema: {
                description: "Assign a unique code",
                tags: ["partner"],
                summary: "",
                body
            }
        },
        async (request, response) => {
            assert(request.body);

            const {
                uniqueCode,
                value
            } = request.body;

            response.send({
                success: await assignUniqueCode({
                    uniqueCode,
                    partnerId: "1234",
                    value
                })
            });
        }
    );
}

