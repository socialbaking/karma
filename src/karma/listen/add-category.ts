import {FastifyInstance, FastifyRequest} from "fastify";
import {FromSchema} from "json-schema-to-ts";
import {addCategory} from "../data";
import {accessToken, allowAnonymous} from "./bearer-authentication";

export async function addCategoryRoutes(fastify: FastifyInstance) {

    const body = {
        type: "object",
        properties: {
            categoryName: {
                type: "string"
            },
            categoryDescription: {
                type: "string"
            }
        },
        required: [
            "categoryName"
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
                categoryId: {
                    type: "string"
                },
                categoryName: {
                    type: "string"
                },
                categoryDescription: {
                    type: "string"
                },
            },
            required: [
                "categoryId",
                "categoryName"
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
        "/categories",
        {
            schema,
            preHandler: fastify.auth([
                fastify.verifyBearerAuth,
                accessToken
            ]),
            async handler(request, response)  {
                const {
                    categoryName
                } = request.body;

                const Category = await addCategory({
                    categoryName
                });

                response.status(201);
                response.send(Category);
            }
        }
    )
}

