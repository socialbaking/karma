import {FastifyInstance} from "fastify";
import {background} from "../background";

export async function backgroundRoutes(fastify: FastifyInstance) {

    fastify.get("/background", {
        async handler(request, response) {

            await background({
                method: request.method,
                query: request.query,
                headers: request.headers,
                body: request.body
            });

            response.status(200);
            response.send();

        }
    });

}