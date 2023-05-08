import {addPartnerRoutes} from "./add-partner";
import {retrieveSystemLogsRoutes} from "./retrieve-system-logs";
import {FastifyInstance} from "fastify";
import {retrievePartnerRoutes} from "./retrieve-partners";
import {viewRoutes} from "../view";
import {addCategoryRoutes} from "./add-category";

export async function routes(fastify: FastifyInstance) {

    async function apiRoutes(fastify: FastifyInstance) {
        fastify.register(addPartnerRoutes);
        fastify.register(addCategoryRoutes);
        fastify.register(retrieveSystemLogsRoutes);
        fastify.register(retrievePartnerRoutes);

        // TODO: Register routes here
    }

    fastify.register(apiRoutes, {
        prefix: "/api/version/1"
    });
    fastify.register(viewRoutes);
}