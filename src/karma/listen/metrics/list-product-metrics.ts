import { FastifyInstance } from "fastify";
import { metricsSchema, listProductMetrics } from "../../data";
import { authenticate } from "../authentication";

export async function listProductMetricsRoutes(fastify: FastifyInstance) {
  const params = {
    type: "object",
    properties: {
      productId: {
        type: "string",
      },
    },
    required: ["productId"],
  };

  const response = {
    200: {
      type: "array",
      items: metricsSchema.countryMetrics,
    },
  };

  const schema = {
    description: "List of product metrics",
    tags: ["metrics"],
    summary: "",
    response,
    params,
    security: [
      {
        apiKey: [] as string[],
      },
    ],
  };

  type Schema = {
    Params: {
      productId: string;
    };
  };

  fastify.get<Schema>("/products/:productId", {
    schema,
    preHandler: authenticate(fastify),
    async handler(request, response) {
      const { productId } = request.params;
      response.send(await listProductMetrics(productId));
    },
  });
}
