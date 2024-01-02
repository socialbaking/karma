import { FastifyInstance, FastifyRequest } from "fastify";
import { listCategories, categorySchema } from "../../data";
import { authenticate } from "../authentication";

export async function listCategoryRoutes(fastify: FastifyInstance) {
  const response = {
    200: {
      type: "array",
      items: categorySchema.category,
    },
  };

  const schema = {
    description: "List of categories",
    tags: ["category"],
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
    async handler(request: FastifyRequest, response) {
      response.send(await listCategories());
    },
  });
}
