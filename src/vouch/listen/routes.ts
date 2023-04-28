import {FetchEvent} from "@virtualstate/listen";
import {acceptUniqueCode} from "./accept-unique-code";
import {assignUniqueCode} from "./assign-unique-code";
import {addPartner} from "./add-partner";
import {verifyCodeValidity} from "./verify-code-validity";
import {generateUniqueCode} from "./generate-unique-code";
import {retrieveSystemLogs} from "./retrive-system-logs";
import {retrieveCodeData} from "./retrieve-code-data";
import {retrieveCodeDetails} from "./retrieve-code-public-details";
import {FastifyInstance} from "fastify";

export async function routes(fastify: FastifyInstance) {

    async function apiRoutes(fastify: FastifyInstance) {
        fastify.register(acceptUniqueCode);
        fastify.register(assignUniqueCode);
        fastify.register(addPartner);
        fastify.register(verifyCodeValidity);
        fastify.register(generateUniqueCode);
        fastify.register(retrieveSystemLogs);
        fastify.register(retrieveCodeData);
        fastify.register(retrieveCodeDetails);
    }

    fastify.register(apiRoutes, {
        prefix: "/api"
    });
}