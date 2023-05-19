import { FastifyInstance, FastifyRequest } from "fastify";
import { listDailyMetrics, metricsSchema } from "../../data";
import { authenticate } from "../authentication";

export async function listDailyMetricsRoutes(fastify: FastifyInstance) {
  const response = {
    200: {
      type: "array",
      items: metricsSchema.countryMetrics,
    },
  };

  const schema = {
    description: "List of daily metrics",
    tags: ["metrics"],
    summary: "",
    response,
    security: [
      {
        apiKey: [] as string[],
      },
    ],
  };

  fastify.get("/days", {
    schema,
    preHandler: authenticate(fastify),
    async handler(request: FastifyRequest, response) {
      response.send(await listDailyMetrics());
    },
  });
}
