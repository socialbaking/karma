import {FastifyInstance} from "fastify";
import {FromSchema} from "json-schema-to-ts";

export async function wordpressAdminRoutes(fastify: FastifyInstance) {

    const querystring = {
        type: "object",
        properties: {
        },
        required: [
        ]
    } as const;
    const schema = {
        description: "Retrieve public code data",
        tags: ["patient"],
        summary: "",
        querystring
    }

    type Schema = {
        Querystring: FromSchema<typeof querystring>
    }

    fastify.get<Schema>(
        "/wordpress-admin",
        {
            schema,
            preHandler: fastify.auth([
               fastify.verifyBearerAuth
            ]),
            async handler(request, response) {
                response.header("Content-Type", "text/html");
                response.send(`
                    <form action="https://vouch.patient.nz/public-code-data" method="get">
                        <input type="text" name="uniqueCode" placeholder="Unique Code" />
                        <button type="submit">Check Info</button>
                    </form>
                `)
            }
        }
    );
}