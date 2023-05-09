import {FastifyInstance} from "fastify";

export async function metricRoutes(fastify: FastifyInstance) {

    async function routes(fastify: FastifyInstance) {

    }

    fastify.register(routes, {
        prefix: "/metrics"
    });

}