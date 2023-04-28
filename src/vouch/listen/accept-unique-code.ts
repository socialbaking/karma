import { route } from "@virtualstate/listen/routes";
import { acceptUniqueCode as example } from "../examples";
import {FetchEvent} from "@virtualstate/listen";
import {FastifyInstance} from "fastify";

export async function acceptUniqueCode(fastify: FastifyInstance) {
    fastify.post("/accept-unique-code", (request, response) => {
        response.send(example.response);
    })

}

