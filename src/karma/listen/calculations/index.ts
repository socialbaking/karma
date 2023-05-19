import { FastifyInstance } from "fastify";
import { listCalculationKeysRoutes } from "./list-calculation-keys";
import { listCalculationRoutes } from "./list-calculations";

export async function calculationRoutes(fastify: FastifyInstance) {
  async function routes(fastify: FastifyInstance) {
    fastify.register(listCalculationKeysRoutes);
    fastify.register(listCalculationRoutes);
  }

  fastify.register(routes, {
    prefix: "/calculations",
  });
}
