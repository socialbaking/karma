import {FastifyInstance} from "fastify";

export async function partnerBalanceRoutes(fastify: FastifyInstance) {

    fastify.get("/partner-balance", async (request, response) => {

        response.header("Content-Type", "text/html");
        response.send(`
            <p>Partner balance will show here!</p>
        `);
    })
}