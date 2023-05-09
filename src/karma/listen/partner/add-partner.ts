import {FastifyInstance} from "fastify";
import {addPartner, PartnerData, partnerSchema} from "../../data";
import {authenticate} from "../authentication";

export async function addPartnerRoutes(fastify: FastifyInstance) {

    type Schema = {
        Body: PartnerData
    }

    const response = {
        201: {
            description: "A new partner",
            ...partnerSchema.partner
        }
    }

    const schema = {
        description: "Add a new partner",
        tags: ["partner"],
        summary: "",
        body: partnerSchema.partnerData,
        response
    }

    fastify.post<Schema>(
        "/",
        {
            schema,
            preHandler: authenticate(fastify, {
                anonymous: true
            }),
            async handler(request, response)  {
                const partner = await addPartner(request.body);

                response.status(201);
                response.send(partner);
            }
        }
    )
}

