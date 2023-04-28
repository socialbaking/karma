import { route } from "@virtualstate/listen/routes";
import { retrieveCodeDetails as example } from "../examples";
import {FetchEvent} from "@virtualstate/listen";
import {FastifyInstance} from "fastify";

export async function retrieveCodeDetails(fastify: FastifyInstance) {
    fastify.get("/retrieve-code-details", (request, response) => {
        response.send(example.response);
    })
}

