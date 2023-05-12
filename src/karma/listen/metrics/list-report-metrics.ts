import {FastifyInstance, FastifyRequest} from "fastify";
import {listReportMetrics, metricsSchema} from "../../data";
import {authenticate} from "../authentication";

export async function listReportMetricsRoutes(fastify: FastifyInstance) {

    const response = {
        200: {
            type: "array",
            items: metricsSchema.reportMetrics
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
        "/reports",
        {
            schema,
            preHandler: authenticate(fastify),
            async handler(request: FastifyRequest, response) {
                response.send(
                    await listReportMetrics()
                );
            }
        }
    );
}