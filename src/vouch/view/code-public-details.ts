import {FastifyInstance} from "fastify";
import {FromSchema} from "json-schema-to-ts";
import {retrieveCodeData, retrieveCodePublicDetails} from "../data";
import {validateAuthorizedForPartnerId} from "./authentication";
import {getPartnerStore} from "../data/partner";

export async function codePublicDetailsRoutes(fastify: FastifyInstance) {

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
        description: "Retrieve public code data",
        tags: ["patient"],
        summary: "",
        querystring
    }

    type Schema = {
        Querystring: FromSchema<typeof querystring>
    }

    fastify.get<Schema>(
        "/public-code-data",
        {
            schema,
            async handler(request, response) {
                const {
                    uniqueCode
                } = request.query;
                const {
                    partnerId,
                    value
                } = await retrieveCodePublicDetails({
                    uniqueCode,
                });
                const {
                    partnerName
                } = await getPartnerStore().get(partnerId)

                return (
                    `
                    <section class="code-details" data-unique-code="${uniqueCode}" data-value="${value}">
                        <p class="unique-code-label">${uniqueCode}</p>
                        <p class="unique-code-value">${value}</p>
                        <p class="unique-code-partner-name">
                            <span>Given by:</span>
                            <span>${partnerName}</span>
                        </p>
                    </section>
                    `
                )
            }
        }
    );
}