import {FastifyInstance} from "fastify";
import {listReportRoutes} from "./list-reports";
import {addReportRoutes} from "./add-report";

export async function reportRoutes(fastify: FastifyInstance) {

    async function routes(fastify: FastifyInstance) {
        fastify.register(listReportRoutes);
        fastify.register(addReportRoutes);
    }

    fastify.register(routes, {
        prefix: "/reports"
    });

}