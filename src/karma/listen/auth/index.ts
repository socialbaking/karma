import {FastifyInstance} from "fastify";
import {discordAuthenticationRoutes} from "./discord";
import {redditAuthenticationRoutes} from "./reddit";

export async function authenticationRoutes(fastify: FastifyInstance) {

    async function routes(fastify: FastifyInstance) {
        fastify.register(discordAuthenticationRoutes);
        fastify.register(redditAuthenticationRoutes);
    }

    fastify.register(routes, {
        prefix: "/authentication"
    })
}