import {FastifyInstance} from "fastify";
import {listCalculationKeysRoutes} from "./list-calculation-keys";

export async function calculationRoutes(fastify: FastifyInstance) {

    async function routes(fastify: FastifyInstance) {
        fastify.register(listCalculationKeysRoutes);
    }

    fastify.register(routes, {
        prefix: "/calculations"
    })
}