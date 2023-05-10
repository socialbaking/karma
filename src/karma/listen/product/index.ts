import {FastifyInstance} from "fastify";
import {listProductRoutes} from "./list-products";
import {addProductRoutes} from "./add-product";
import {getProductRoutes} from "./get-product";

export async function productRoutes(fastify: FastifyInstance) {

    async function routes(fastify: FastifyInstance) {
        fastify.register(listProductRoutes);
        fastify.register(addProductRoutes);
        fastify.register(getProductRoutes);
    }

    fastify.register(routes, {
        prefix: "/products"
    });

}