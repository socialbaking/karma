import { FastifyInstance } from "fastify";
import { viewRoutes } from "../view";
import { backgroundRoutes } from "./background";
import { productRoutes } from "./product";
import { partnerRoutes } from "./partner";
import { metricRoutes } from "./metrics";
import { categoryRoutes } from "./category";
import { reportRoutes } from "./report";
import { calculationRoutes } from "./calculations";
import { organisationRoutes } from "./organisation";
import { offerRoutes } from "./offer";

export async function routes(fastify: FastifyInstance) {
  async function apiRoutes(fastify: FastifyInstance) {
    await fastify.register(productRoutes);
    await fastify.register(partnerRoutes);
    await fastify.register(metricRoutes);
    await fastify.register(categoryRoutes);
    await fastify.register(reportRoutes);
    await fastify.register(calculationRoutes);
    await fastify.register(organisationRoutes);
    await fastify.register(offerRoutes);
  }

  await fastify.register(apiRoutes, {
    prefix: "/api/version/1",
  });

  await fastify.register(backgroundRoutes, {
    prefix: "/api",
  });

  await fastify.register(viewRoutes);
}
