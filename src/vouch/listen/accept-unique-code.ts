import {FastifyInstance} from "fastify";
import {acceptUniqueCode} from "../data";
import {FromSchema} from "json-schema-to-ts";
import {ok} from "../../is";

export async function acceptUniqueCodeRoutes(fastify: FastifyInstance) {

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
        "/accept-unique-code",
        {
          schema: {
              description: "Accept a unique code",
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
                success: await acceptUniqueCode({
                    uniqueCode,
                    partnerId
                })
            });
        }
    )

}

