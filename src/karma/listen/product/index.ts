import {FastifyInstance} from "fastify";
import {listProductRoutes} from "./list-products";

export async function productRoutes(fastify: FastifyInstance) {

    async function routes(fastify: FastifyInstance) {
        fastify.register(listProductRoutes);
    }

    fastify.register(routes, {
        prefix: "/products"
    });

}