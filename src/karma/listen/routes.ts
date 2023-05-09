import {addPartnerRoutes} from "./add-partner";
import {listSystemLogsRoutes} from "./list-system-logs";
import {FastifyInstance} from "fastify";
import {listPartnerRoutes} from "./list-partners";
import {viewRoutes} from "../view";
import {addCategoryRoutes} from "./add-category";
import {backgroundRoutes} from "./background";

export async function routes(fastify: FastifyInstance) {

    async function apiRoutes(fastify: FastifyInstance) {
        fastify.register(addPartnerRoutes);
        fastify.register(addCategoryRoutes);
        fastify.register(listSystemLogsRoutes);
        fastify.register(listPartnerRoutes);

        // TODO: Register routes here
    }

    fastify.register(apiRoutes, {
        prefix: "/api/version/1"
    });

    fastify.register(backgroundRoutes, {
        prefix: "/api"
    })

    fastify.register(viewRoutes);
}