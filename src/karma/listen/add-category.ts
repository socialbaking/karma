import {FastifyInstance, FastifyRequest} from "fastify";
import {FromSchema} from "json-schema-to-ts";
import {addCategory} from "../data";
import {accessToken, allowAnonymous} from "./bearer-authentication";

export async function addCategoryRoutes(fastify: FastifyInstance) {

    const body = {
        type: "object",
        properties: {
            CategoryName: {
                type: "string"
            },
            location: {
                type: "string"
            },
            remote: {
                type: "boolean"
            },
            onsite: {
                type: "boolean"
            },
            clinic: {
                type: "boolean"
            },
            pharmacy: {
                type: "boolean"
            },
            CategoryDescription: {
                type: "string"
            }
        },
        required: [
            "CategoryName",
            "location"
        ]
    } as const;
    type BodySchema = FromSchema<typeof body>

    type Schema = {
        Body: BodySchema
    }

    const response = {
        201: {
            description: "A new Category",
            type: "object",
            properties: {
                CategoryId: {
                    type: "string"
                },
                CategoryName: {
                    type: "string"
                },
                location: {
                    type: "string"
                },
                onsite: {
                    type: "boolean"
                },
                remote: {
                    type: "boolean"
                },
                clinic: {
                    type: "boolean"
                },
                pharmacy: {
                    type: "boolean"
                },
                CategoryDescription: {
                    type: "string"
                },
                accessToken: {
                    type: "string"
                }
            },
            required: [
                "CategoryId",
                "CategoryName",
                "location"
            ]
        }
    }

    const schema = {
        description: "Add a new Category",
        tags: ["Category"],
        summary: "",
        body,
        response
    }

    fastify.post<Schema>(
        "/category",
        {
            schema,
            preHandler: fastify.auth([
                allowAnonymous,
                fastify.verifyBearerAuth,
                accessToken
            ]),
            async handler(request, response)  {
                const {
                    CategoryName,
                    location,
                    onsite,
                    remote
                } = request.body;

                const Category = await addCategory({
                    CategoryName,
                    location,
                    onsite,
                    remote
                });

                response.status(201);
                response.send(Category);
            }
        }
    )
}

