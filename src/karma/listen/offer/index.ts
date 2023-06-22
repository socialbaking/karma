import { FastifyInstance } from "fastify";
import {listOfferRoutes} from "./list-offers";

export async function offerRoutes(fastify: FastifyInstance) {
  async function routes(fastify: FastifyInstance) {
    await fastify.register(listOfferRoutes);
  }

  await fastify.register(routes, {
    prefix: "/offers",
  });
}
