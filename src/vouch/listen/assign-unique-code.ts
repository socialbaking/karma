import { route } from "@virtualstate/listen/routes";
import { assignUniqueCode as example } from "../examples";
import {FetchEvent} from "@virtualstate/listen";
import {FastifyInstance} from "fastify";

export async function assignUniqueCode(fastify: FastifyInstance) {
    fastify.post("/assign-unique-code", (request, response) => {
        response.send(example.response);
    })
}

