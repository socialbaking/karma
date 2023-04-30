import {FastifyInstance} from "fastify";
import {FromSchema} from "json-schema-to-ts";
import {getPartner} from "../data/partner";
import {getAccessToken, accessToken, getAuthorizedForPartnerId} from "./authentication";

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
               fastify.verifyBearerAuth,
               accessToken
            ]),
            async handler(request, response) {
                const partnerId = getAuthorizedForPartnerId();
                const {
                    partnerName
                } = await getPartner(partnerId);
                const accessToken = await getAccessToken();
                response.header("Content-Type", "text/html");
                response.send(`
                    <form action="https://vouch.patient.nz/code-data" method="get">
                        <p>Authenticated as partner: ${partnerName}</p>
                        <input type="hidden" name="accessToken" value="${accessToken}" />
                        <input type="text" name="uniqueCode" placeholder="Unique Code" />
                        <button type="submit">Check Info</button>
                    </form>
                `)
            }
        }
    );
}