import { FastifyInstance } from "fastify";
import {listOfferRoutes} from "./list-offers";

export async function offerRoutes(fastify: FastifyInstance) {
  async function routes(fastify: FastifyInstance) {
    fastify.register(listOfferRoutes);
  }

  fastify.register(routes, {
    prefix: "/offers",
  });
}
