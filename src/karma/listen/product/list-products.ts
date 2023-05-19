import { FastifyInstance, FastifyRequest } from "fastify";
import { listProducts, productSchema } from "../../data";
import { authenticate } from "../authentication";

export async function listProductRoutes(fastify: FastifyInstance) {
  const response = {
    200: {
      type: "array",
      items: productSchema.product,
    },
  };

  const schema = {
    description: "List of products",
    tags: ["product"],
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
      response.send(await listProducts());
    },
  });
}
