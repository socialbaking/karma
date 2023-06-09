import {FastifyInstance, FastifyReply} from "fastify";
import {getProductFile, listCategories, listOrganisations, listProducts} from "../../data";
import {authenticate} from "../authentication";
import {readFile} from "node:fs/promises";
import {isAnonymous} from "../../authentication";
import {getMatchingProducts} from "../../utils";

export async function getProductFileRoutes(fastify: FastifyInstance) {

    async function handleProductId(productId: string, response: FastifyReply) {
        const image = await getProductFile(productId, {
            accept: "image",
            public: isAnonymous()
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
    }

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
                await handleProductId(request.params.productId, response);
            },
        });

    }

    {
        const params = {
            type: "object",
            properties: {
                search: {
                    type: "string",
                },
            },
            required: ["search"],
        };

        const schema = {
            description: "Get a product image by name",
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
                search: string;
            };
        };

        fastify.get<Schema>("/image/search/:search", {
            schema,
            preHandler: authenticate(fastify, { anonymous: true }),
            async handler(request, response) {
                const products = await listProducts({
                    public: isAnonymous()
                });
                const organisations = await listOrganisations();
                const categories = await listCategories()
                const matched = getMatchingProducts(products, organisations, categories, request.params.search);
                if (!matched.length) {
                    response.status(404);
                    response.send();
                    return;
                }
                await handleProductId(matched[0].productId, response);
            },
        });

    }

}