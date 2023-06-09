import {FastifyInstance, FastifyReply} from "fastify";
import {
    getProductFile,
    getProductFiles,
    listCategories,
    listOrganisations,
    listProductFiles,
    listProducts,
    fileSchema
} from "../../data";
import {authenticate} from "../authentication";
import {readFile} from "node:fs/promises";
import {isAnonymous, getMaybePartner} from "../../authentication";
import {getMatchingProducts} from "../../utils";

// 7 days
const DEFAULT_PARTNER_EXPIRES_IN_SECONDS = 604800;
// 1 day
const DEFAULT_AUTHENTICATED_EXPIRES_IN_SECONDS = 86400;

export async function getProductFileRoutes(fastify: FastifyInstance) {

    interface Query {
        index?: number
    }

    const querystring = {
        type: "object",
        properties: {
            index: {
                type: "number",
                nullable: true
            },
        }
    };

    async function handleProductId(productId: string, query: Query, response: FastifyReply) {
        const image = await getProductFile(productId, {
            ...query,
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
            querystring,
            security: [
                {
                    apiKey: [] as string[],
                },
            ],
        };

        interface Params {
            productId: string;
        }

        type Schema = {
            Params: Params,
            Querystring: Query
        };

        fastify.get<Schema>("/:productId/image", {
            schema,
            preHandler: authenticate(fastify, { anonymous: true }),
            async handler(request, response) {
                await handleProductId(request.params.productId, request.query, response);
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
            querystring,
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
            Querystring: Query
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
                await handleProductId(matched[0].productId, request.query, response);
            },
        });

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

        const response = {
            200: {
                description: "List of files",
                type: "array",
                items: fileSchema.file
            },
        };

        const schema = {
            description: "List product files",
            tags: ["product"],
            summary: "",
            params,
            response,
            security: [
                {
                    apiKey: [] as string[],
                },
            ],
        };

        interface Params {
            productId: string;
        }

        type Schema = {
            Params: Params
        };

        fastify.get<Schema>("/:productId/files", {
            schema,
            preHandler: authenticate(fastify, { anonymous: true }),
            async handler(request, response) {
                let expiresInSeconds: number | undefined = undefined;
                if (getMaybePartner()) {
                    expiresInSeconds = DEFAULT_PARTNER_EXPIRES_IN_SECONDS;
                } else if (!isAnonymous()) {
                    expiresInSeconds = DEFAULT_AUTHENTICATED_EXPIRES_IN_SECONDS;
                }
                const files = await getProductFiles(request.params.productId, {
                    public: isAnonymous(),
                    accept: "image",
                    sizes: true,
                    expiresInSeconds
                });
                response.send(files);
            },
        });
    }

}