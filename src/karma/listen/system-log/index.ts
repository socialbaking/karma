import {FastifyInstance} from "fastify";
import {listSystemLogsRoutes} from "./list-system-logs";

export async function systemLogRoutes(fastify: FastifyInstance) {

    async function routes(fastify: FastifyInstance) {
        fastify.register(listSystemLogsRoutes);
    }

    fastify.register(routes, {
        prefix: "/system-logs"
    });

}