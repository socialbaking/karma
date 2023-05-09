import {FastifyInstance} from "fastify";

export async function reportRoutes(fastify: FastifyInstance) {

    async function routes(fastify: FastifyInstance) {

    }

    fastify.register(routes, {
        prefix: "/reports"
    });

}