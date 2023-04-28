import { route } from "@virtualstate/listen/routes";
import { generateUniqueCode as example } from "../examples";
import {FetchEvent} from "@virtualstate/listen";
import {FastifyInstance} from "fastify";

export async function generateUniqueCode(fastify: FastifyInstance) {
    fastify.post("/generate-unique-code", (request, response) => {
        response.send(example.response);
    })
}
