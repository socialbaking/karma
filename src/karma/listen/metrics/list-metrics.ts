import { FastifyInstance, FastifyRequest } from "fastify";
import { metricsSchema, listMetrics } from "../../data";
import { authenticate } from "../authentication";

export async function listMetricsRoutes(fastify: FastifyInstance) {
  const response = {
    200: {
      type: "array",
      items: metricsSchema.countryMetrics,
    },
  };

  const schema = {
    description: "List of metrics",
    tags: ["metrics"],
    summary: "",
    response,
    security: [
      {
        apiKey: [] as string[],
      },
    ],
  };

  fastify.get("/", {
    schema,
    preHandler: authenticate(fastify),
    async handler(request: FastifyRequest, response) {
      response.send(await listMetrics());
    },
  });
}
