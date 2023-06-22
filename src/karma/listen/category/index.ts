import { FastifyInstance } from "fastify";
import { addCategoryRoutes } from "./add-category";
import { listCategoryRoutes } from "./list-categories";

export async function categoryRoutes(fastify: FastifyInstance) {
  async function routes(fastify: FastifyInstance) {
    await fastify.register(addCategoryRoutes);
    await fastify.register(listCategoryRoutes);
  }

  await fastify.register(routes, {
    prefix: "/categories",
  });
}
