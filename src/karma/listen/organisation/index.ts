import {FastifyInstance} from "fastify";
import {listOrganisationsRoutes} from "./list-organisations";

export async function organisationRoutes(fastify: FastifyInstance) {

    async function routes(fastify: FastifyInstance) {
        fastify.register(listOrganisationsRoutes);
    }

    fastify.register(routes, {
        prefix: "/organisations"
    });

}