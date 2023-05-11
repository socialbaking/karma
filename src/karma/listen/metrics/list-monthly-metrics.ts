import {FastifyInstance, FastifyRequest} from "fastify";
import {listMonthlyMetrics, metricsSchema} from "../../data";
import {authenticate} from "../authentication";

export async function listMonthlyMetricsRoutes(fastify: FastifyInstance) {

    const response = {
        200: {
            type: "array",
            items: metricsSchema.countryMetrics
        }
    }

    const schema = {
        description: "List of daily metrics",
        tags: ["metrics"],
        summary: "",
        response,
        security: [
            {
                apiKey: [] as string[]
            }
        ]
    };

    fastify.get(
        "/month",
        {
            schema,
            preHandler: authenticate(fastify),
            async handler(request: FastifyRequest, response) {
                response.send(
                    await listMonthlyMetrics()
                );
            }
        }
    );
}