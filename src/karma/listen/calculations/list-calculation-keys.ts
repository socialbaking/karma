import {FastifyInstance} from "fastify";
import {calculationKeys} from "../../calculations";

export async function listCalculationKeysRoutes(fastify: FastifyInstance) {


    const response = {
        201: {
            type: "array",
            items: {
                type: "string"
            }
        }
    }

    const schema = {
        description: "List of calculation keys",
        tags: ["calculations"],
        summary: "",
        response
    };

    fastify.get("/keys", {
        schema,
        async handler (request, response) {
            response.status(200)
            response.send(calculationKeys);
        }
    })
}