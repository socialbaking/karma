import {FastifyInstance} from "fastify";
import {FromSchema} from "json-schema-to-ts";
import {ok} from "../../is";
import {processPayment} from "../data";
import {validateAuthorizedForPartnerId} from "./authentication";

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
    type Schema = {
        Body: BodySchema
    }
    const schema = {
        description: "Process a payment",
        tags: ["partner"],
        summary: "",
        body,
        security: [
            {
                apiKey: [] as string[]
            }
        ]
    };

    fastify.post<Schema>(
        "/process-payment",
        {
            schema,
            preHandler: fastify.auth([
               fastify.verifyBearerAuth
            ]),
            async handler(request, response) {
                const {
                    uniqueCode,
                    partnerId
                } = request.body;

                validateAuthorizedForPartnerId(partnerId);

                response.send({
                    success: await processPayment({
                        partnerId,
                        uniqueCode
                    })
                });
            }
        }
    );
}
