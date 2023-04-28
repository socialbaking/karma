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
                value
            } = request.body;

            response.send({
                success: await generateUniqueCode({
                    partnerId: "1234",
                    value
                })
            });
        }
    );

    // fastify.post("/generate-unique-code", async (request, response) => {
    //     const store = getKeyValueStore();
    //     const uniqueCode = await generateActualCode();
    //     const createdAt = new Date().toISOString();
    //     const document = {
    //         uniqueCode,
    //         createdAt,
    //         updatedAt: createdAt
    //     }
    //     await store.set(`#code#${uniqueCode}`, document)
    //     await store.set(`#log#${v4()}`, {
    //         message: "Unique code generated",
    //         uniqueCode,
    //         timestamp: createdAt
    //     })
    //     response.send(document);
    // })
}
