import { FastifyInstance, FastifyRequest } from "fastify";
import {listCategories, listOrganisations, listProducts, productSchema} from "../../data";
import { authenticate } from "../authentication";
import {isAnonymous} from "../../authentication";
import {getMatchingProducts} from "../../utils";

export async function listProductRoutes(fastify: FastifyInstance) {
  const querystring = {
    type: "object",
    properties: {
      search: {
        type: "string",
        nullable: true
      }
    }
  }

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
    querystring,
    security: [
      {
        apiKey: [] as string[],
      },
    ],
  };

  interface Querystring {
    search?: string;
  }

  interface Schema {
    Querystring: Querystring;
  }

  fastify.get<Schema>("/", {
    schema,
    preHandler: authenticate(fastify, { anonymous: true }),
    async handler(request, response) {
      console.log("fastify list")
      let products = await listProducts({
        public: isAnonymous()
      });
      console.log(products.length, request.query)
      if (request.query.search) {
        const organisations = await listOrganisations();
        const categories = await listCategories();
        products = getMatchingProducts(products, organisations, categories, request.query.search);
      }
      response.send(products);
    },
  });
}
