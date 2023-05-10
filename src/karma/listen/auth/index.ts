import {FastifyInstance} from "fastify";
import {discordAuthenticationRoutes} from "./discord";

export async function authenticationRoutes(fastify: FastifyInstance) {

    async function routes(fastify: FastifyInstance) {
        fastify.register(discordAuthenticationRoutes);
    }

    fastify.register(routes, {
        prefix: "/authentication"
    })
}