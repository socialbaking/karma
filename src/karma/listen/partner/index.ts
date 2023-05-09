import {FastifyInstance} from "fastify";
import {addPartnerRoutes} from "./add-partner";
import {listPartnerRoutes} from "./list-partners";

export async function partnerRoutes(fastify: FastifyInstance) {

    async function routes(fastify: FastifyInstance) {
        fastify.register(addPartnerRoutes);
        fastify.register(listPartnerRoutes);
    }

    fastify.register(routes, {
        prefix: "/partners"
    });

}