import {FastifyInstance} from "fastify";

export async function productRoutes(fastify: FastifyInstance) {

    async function routes(fastify: FastifyInstance) {

    }

    fastify.register(routes, {
        prefix: "/products"
    });

}