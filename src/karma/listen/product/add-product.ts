import { FastifyInstance } from "fastify";
import { addProduct, ProductData, productSchema } from "../../data";
import { authenticate } from "../authentication";

export async function addProductRoutes(fastify: FastifyInstance) {
  type Schema = {
    Body: ProductData;
  };

  const response = {
    201: {
      description: "A new product",
      ...productSchema.product,
    },
  };

  const schema = {
    description: "Add a new product",
    tags: ["product"],
    summary: "",
    body: productSchema.productData,
    response,
    security: [
      {
        apiKey: [] as string[],
      },
    ],
  };

  fastify.post<Schema>("/", {
    schema,
    preHandler: authenticate(fastify),
    async handler(request, response) {
      const product = await addProduct(request.body);
      response.status(201);
      response.send(product);
    },
  });
}
