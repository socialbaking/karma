import { FastifyInstance } from "fastify";
import { getProduct, productSchema } from "../../data";
import { authenticate } from "../authentication";

export async function getProductRoutes(fastify: FastifyInstance) {
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
      description: "A product",
      ...productSchema.product,
    },
  };

  const schema = {
    description: "Get a product",
    tags: ["product"],
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

  fastify.get<Schema>("/:productId", {
    schema,
    preHandler: authenticate(fastify),
    async handler(request, response) {
      const product = await getProduct(request.params.productId);
      if (!product) response.status(404);
      response.send(product);
    },
  });
}
