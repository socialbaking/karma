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
    fastify.register(productRoutes);
    fastify.register(partnerRoutes);
    fastify.register(metricRoutes);
    fastify.register(categoryRoutes);
    fastify.register(reportRoutes);
    fastify.register(calculationRoutes);
    fastify.register(organisationRoutes);
    fastify.register(offerRoutes);
  }

  fastify.register(apiRoutes, {
    prefix: "/api/version/1",
  });

  // fastify.register(authenticationRoutes, {
  //   prefix: "/api",
  // });

  fastify.register(backgroundRoutes, {
    prefix: "/api",
  });

  fastify.register(viewRoutes);
}
