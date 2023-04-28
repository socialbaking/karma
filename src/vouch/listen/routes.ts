import {acceptUniqueCodeRoutes} from "./accept-unique-code";
import {assignUniqueCodeRoutes} from "./assign-unique-code";
import {addPartnerRoutes} from "./add-partner";
import {verifyCodeValidityRoutes} from "./verify-code-validity";
import {generateUniqueCodeRoutes} from "./generate-unique-code";
import {retrieveSystemLogsRoutes} from "./retrive-system-logs";
import {retrieveCodeDataRoutes} from "./retrieve-code-data";
import {retrieveCodeDetailsRoutes} from "./retrieve-code-public-details";
import {FastifyInstance} from "fastify";

export async function routes(fastify: FastifyInstance) {

    async function apiRoutes(fastify: FastifyInstance) {
        fastify.register(acceptUniqueCodeRoutes);
        fastify.register(assignUniqueCodeRoutes);
        fastify.register(addPartnerRoutes);
        fastify.register(verifyCodeValidityRoutes);
        fastify.register(generateUniqueCodeRoutes);
        fastify.register(retrieveSystemLogsRoutes);
        fastify.register(retrieveCodeDataRoutes);
        fastify.register(retrieveCodeDetailsRoutes);
    }

    fastify.register(apiRoutes, {
        prefix: "/api"
    });
}