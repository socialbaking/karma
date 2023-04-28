import { route } from "@virtualstate/listen/routes";
import { processPayment as example } from "../examples";
import {FetchEvent} from "@virtualstate/listen";
import {FastifyInstance} from "fastify";

export async function processPayment(fastify: FastifyInstance) {
    fastify.post("/process-payment", (request, response) => {
        response.send(example.response);
    })
}
