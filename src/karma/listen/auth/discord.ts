import {FastifyInstance} from "fastify";

export async function discordAuthenticationRoutes(fastify: FastifyInstance) {

    fastify.get("/discord", {
        async handler(request, response) {
            response.status(200)
            response.send("Redirect caught");
        }
    })

}