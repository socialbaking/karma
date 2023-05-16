import {FastifyInstance, FastifyRequest} from "fastify";
import {listOrganisations, organisationSchema} from "../../data";
import {authenticate} from "../authentication";
import {getMaybeAuthorizedForOrganisationId} from "../../authentication";

export async function listOrganisationsRoutes(fastify: FastifyInstance) {

    const response = {
        200: {
            type: "array",
            items: organisationSchema.organisation
        }
    }

    const schema = {
        description: "List of organisations",
        tags: ["organisation"],
        summary: "",
        response,
        security: [
            {
                apiKey: [] as string[]
            }
        ]
    };

    fastify.get(
        "/",
        {
            schema,
            preHandler: authenticate(fastify, {
                anonymous: true
            }),
            async handler(request: FastifyRequest, response) {
                const authorizedOrganisationId = getMaybeAuthorizedForOrganisationId();
                response.send(
                    await listOrganisations({
                        authorizedOrganisationId
                    })
                );
            }
        }
    );
}

