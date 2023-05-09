import {FastifyInstance} from "fastify";
import {background} from "../background";

export async function backgroundRoutes(fastify: FastifyInstance) {

    fastify.get("/background", {
        async handler(request, response) {

            await background({
                query: request.query
            });

            response.status(200);
            response.send();

        }
    });

}