import { route } from "@virtualstate/listen/routes";
import { retrieveCodeData as example } from "../examples";
import {FetchEvent} from "@virtualstate/listen";
import {FastifyInstance} from "fastify";

export async function retrieveCodeData(fastify: FastifyInstance) {
    fastify.get("/retrieve-code-data", (request, response) => {
        response.send(example.response);
    })
}

