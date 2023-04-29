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
                uniqueCode,
                partnerId
            } = request.body;

            response.send({
                success: await processPayment({
                    partnerId,
                    uniqueCode
                })
            });
        }
    );
}
