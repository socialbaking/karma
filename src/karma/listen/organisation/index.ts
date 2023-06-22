import { FastifyInstance } from "fastify";
import { listOrganisationsRoutes } from "./list-organisations";

export async function organisationRoutes(fastify: FastifyInstance) {
  async function routes(fastify: FastifyInstance) {
    await fastify.register(listOrganisationsRoutes);
  }

  await fastify.register(routes, {
    prefix: "/organisations",
  });
}
