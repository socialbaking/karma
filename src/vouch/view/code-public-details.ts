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
                const code = await retrieveCodePublicDetails({
                    uniqueCode,
                });
                if (!code) {
                    response.status(302)
                    const params = new URLSearchParams();
                    params.set("notFound", "true");
                    params.set("uniqueCode", uniqueCode);
                    response.header("Location", `/request-code-data?${params.toString()}`);
                    return response.send("Could not find the code");
                }
                const {
                    partnerId,
                    value
                } = code;
                const {
                    partnerName,
                    location,
                    partnerDescription
                } = await getPartnerStore().get(partnerId)

                response.header("Content-Type", "text/html");
                response.send(
                    `
                    <style>
                        .unique-code-details, .unique-code-partner {
                            display: flex;
                            flex-direction: column;
                        }
                    </style>
                    <section class="unique-code-details" data-unique-code="${uniqueCode}" data-value="${value}">
                        <div class="unique-code-label">${uniqueCode}</div>
                        <div class="unique-code-value">${value}</div>
                        <div class="unique-code-partner">
                            <div class="vouch-header">Given by:</div>
                            <div class="vouch-partner-name">${partnerName}</div>
                            ${partnerDescription ? `<div class="vouch-partner-name">${partnerDescription}</div>` : ""}
                            <div class="vouch-partner-location">${location}</div>
                        </div>
                    </section>
                    `
                )
            }
        }
    );
}