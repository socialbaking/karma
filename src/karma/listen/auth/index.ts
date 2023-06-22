import { FastifyInstance } from "fastify";
import { discordAuthenticationRoutes } from "./discord";
import { redditAuthenticationRoutes } from "./reddit";
import { authsignalAuthenticationRoutes } from "./authsignal";
import { logoutRoutes } from "./logout";

export async function authenticationRoutes(fastify: FastifyInstance) {
  async function routes(fastify: FastifyInstance) {
    await fastify.register(discordAuthenticationRoutes);
    await fastify.register(redditAuthenticationRoutes);
    await fastify.register(authsignalAuthenticationRoutes);
    await fastify.register(logoutRoutes);
  }

  await fastify.register(routes, {
    prefix: "/authentication",
  });
}
