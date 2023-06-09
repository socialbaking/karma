import {FastifyInstance} from "fastify";
import {getProductFile} from "../../data";
import {authenticate} from "../authentication";
import {readFile} from "node:fs/promises";

export async function getProductFileRoutes(fastify: FastifyInstance) {

    {
        const params = {
            type: "object",
            properties: {
                productId: {
                    type: "string",
                },
            },
            required: ["productId"],
        };

        const schema = {
            description: "Get a product image",
            tags: ["product"],
            summary: "",
            params,
            security: [
                {
                    apiKey: [] as string[],
                },
            ],
        };


        type Schema = {
            Params: {
                productId: string;
            };
        };

        fastify.get<Schema>("/:productId/image", {
            schema,
            preHandler: authenticate(fastify, { anonymous: true }),
            async handler(request, response) {
                const image = await getProductFile(request.params.productId, {
                    accept: "image"
                });
                if (!image) {
                    response.status(404);
                    response.send();
                    return;
                }
                const { url } = image;
                if (url.startsWith("file://")) {
                    const { pathname } = new URL(url);
                    const contents = await readFile(pathname);
                    response.header("Content-Type", image.contentType);
                    response.send(contents);
                    return;
                }
                response.header("Location", url);
                response.status(302);
                response.send();
            },
        });

    }

}