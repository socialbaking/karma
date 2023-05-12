import {FastifyInstance} from "fastify";
import {calculationKeys} from "../../calculations";

export async function listCalculationKeysRoutes(fastify: FastifyInstance) {
    fastify.get("/keys", async (request, response) => {
        response.status(200)
        response.send(calculationKeys);
    })
}