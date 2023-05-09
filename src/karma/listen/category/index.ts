import {FastifyInstance} from "fastify";
import {addCategoryRoutes} from "./add-category";

export async function categoryRoutes(fastify: FastifyInstance) {

    async function routes(fastify: FastifyInstance) {
        fastify.register(addCategoryRoutes);
    }

    fastify.register(routes, {
        prefix: "/categories"
    });

}