import {FastifyInstance} from "fastify";
import {addCategoryRoutes} from "./add-category";
import {listCategoryRoutes} from "./list-categories";

export async function categoryRoutes(fastify: FastifyInstance) {

    async function routes(fastify: FastifyInstance) {
        fastify.register(addCategoryRoutes);
        fastify.register(listCategoryRoutes);
    }

    fastify.register(routes, {
        prefix: "/categories"
    });

}