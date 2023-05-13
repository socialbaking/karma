import {FastifyInstance} from "fastify";
import {metricsSchema, addReportMetrics, MetricsData, partnerSchema} from "../../data";
import {authenticate} from "../authentication";
import {isAnonymous} from "../../authentication";
import {reportMetricData} from "../../data/metrics/schema";

export async function addReportMetricsRoutes(fastify: FastifyInstance) {

    type Schema = {
        Body: MetricsData
    }
    const response = {
        201: {
            description: "A new metrics report",
            ...metricsSchema.reportMetrics
        }
    }

    const schema = {
        description: "Report new metrics",
        tags: ["metrics"],
        summary: "",
        body: metricsSchema.reportMetricData,
        response,
        security: [
            {
                apiKey: [] as string[]
            }
        ]
    }

    fastify.post<Schema>(
        "/reports",
        {
            schema,
            preHandler: authenticate(fastify, {
                anonymous: true
            }),
            async handler(request, response) {
                const data = request.body;
                const metrics = await addReportMetrics({
                    ...data,
                    anonymous: isAnonymous()
                });
                response.status(201);
                response.send(metrics);
            }
        }
    );
}