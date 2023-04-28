import { route } from "@virtualstate/listen/routes";
import { addPartner as example } from "../examples";
import {FetchEvent} from "@virtualstate/listen";
import {FastifyInstance} from "fastify";

export async function addPartner(fastify: FastifyInstance) {
    fastify.post("/add-partner", (request, response) => {
        response.send(example.response);
    })
}

