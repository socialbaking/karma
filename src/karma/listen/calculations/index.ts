import { FastifyInstance } from "fastify";
import { listCalculationKeysRoutes } from "./list-calculation-keys";
import { listCalculationRoutes } from "./list-calculations";

export async function calculationRoutes(fastify: FastifyInstance) {
  async function routes(fastify: FastifyInstance) {
    await fastify.register(listCalculationKeysRoutes);
    await fastify.register(listCalculationRoutes);
  }

  await fastify.register(routes, {
    prefix: "/calculations",
  });
}
