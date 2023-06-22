import { FastifyInstance } from "fastify";
import { addPartnerRoutes } from "./add-partner";
import { listPartnerRoutes } from "./list-partners";

export async function partnerRoutes(fastify: FastifyInstance) {
  async function routes(fastify: FastifyInstance) {
    await fastify.register(addPartnerRoutes);
    await fastify.register(listPartnerRoutes);
  }

  await fastify.register(routes, {
    prefix: "/partners",
  });
}
