import { route } from "@virtualstate/listen/routes";
import { retrieveSystemLogs as example } from "../examples";
import {FetchEvent} from "@virtualstate/listen";
import {FastifyInstance} from "fastify";

export async function retrieveSystemLogs(fastify: FastifyInstance) {
    fastify.get("/system-logs", (request, response) => {
        response.send(example.response);
    })
}

