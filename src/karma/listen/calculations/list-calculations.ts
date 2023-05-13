import {FastifyInstance} from "fastify";
import {calculationKeys, calculationSources} from "../../calculations";
import {calculationSchema} from "../../data";

export async function listCalculationRoutes(fastify: FastifyInstance) {

    const response = {
        201: {
            type: "array",
            items: calculationSchema.calculationSource
        }
    }

    const schema = {
        description: "List of calculations",
        tags: ["calculations"],
        summary: "",
        response
    }

    fastify.get("/", {
        schema,
        async handler(request, response) {
            response.status(200)
            response.send(calculationSources);
        }
    })
}