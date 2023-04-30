import {FastifyInstance} from "fastify";
import {FromSchema} from "json-schema-to-ts";
import {retrieveCodeData} from "../data";
import {validateAuthorizedForPartnerId} from "./authentication";

export async function codeDataRoutes(fastify: FastifyInstance) {

    const querystring = {
        type: "object",
        properties: {
            uniqueCode: {
                type: "string"
            }
        },
        required: [
            "uniqueCode"
        ]
    } as const;
    const schema = {
        description: "Retrieve private code data",
        tags: ["patient"],
        summary: "",
        querystring
    }

    type Schema = {
        Querystring: FromSchema<typeof querystring>
    }

    fastify.get<Schema>(
        "/code-data",
        {
            schema,
            async handler(request, response) {
                const {
                    uniqueCode
                } = request.query;
                const {
                    partnerId
                } = await retrieveCodeData({
                    uniqueCode,
                });
                validateAuthorizedForPartnerId(partnerId);
            }
        }
    );
}