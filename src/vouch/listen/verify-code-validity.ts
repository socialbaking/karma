import { route } from "@virtualstate/listen/routes";
import { verifyCodeValidity as example } from "../examples";
import {FetchEvent} from "@virtualstate/listen";
import {FastifyInstance} from "fastify";

export async function verifyCodeValidity(fastify: FastifyInstance) {
    fastify.post("/verify-code-validity", (request, response) => {
        response.send(example.response);
    })
}

