import {FastifyInstance} from "fastify";
import {FromSchema} from "json-schema-to-ts";
import {ok} from "../../is";
import {processPayment} from "../data";

export async function processPaymentRoutes(fastify: FastifyInstance) {
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
        "/process-payment",
        {
            schema: {
                description: "Process a payment",
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
                success: await processPayment({
                    partnerId: "1234",
                    uniqueCode
                })
            });
        }
    );
}
