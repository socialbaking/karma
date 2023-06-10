import {FastifyInstance} from "fastify";
import {dirname, join} from "node:path";
import {root} from "../../package";
import {readFile} from "node:fs/promises";
import {DOMParser, XMLSerializer} from "xmldom";
import sharp from "sharp";

export async function getProductImageWatermarkRoutes(fastify: FastifyInstance) {

    {
        type Schema = {
            Querystring: {
                name: string
                community?: string
            }
        }
        const querystring = {
            type: "object",
            properties: {
                name: {
                    type: "string"
                },
                community: {
                    type: "string",
                    nullable: true
                }
            },
            required: ["name"]
        };

        const schema = {
            description: "Get a product image watermark with a name",
            tags: ["product"],
            summary: "",
            querystring,
            security: [
                {
                    apiKey: [] as string[],
                },
            ],
        };

        async function getSvg(query: Schema["Querystring"]) {
            const watermarkPath = join(root, "./public/named-watermark.svg");
            const watermarkFile = await readFile(watermarkPath, "utf-8");
            const doc = new DOMParser().parseFromString(watermarkFile, "image/svg+xml");

            const author = doc.getElementById("author");
            const community = doc.getElementById("community");
            const communityRect = doc.getElementById("community-rect");

            author.textContent = query.name.substring(0, author.textContent.length);

            if (query.community) {
                community.textContent = query.community;
            } else {
                community.parentNode.removeChild(community);
                communityRect.parentNode.removeChild(communityRect);
            }

            return new XMLSerializer().serializeToString(doc);
        }

        fastify.get<Schema>("/watermark/named.svg", {
            schema,
            async handler(request, response) {
                const svg = await getSvg(request.query);
                response.header("Content-Type", "image/svg+xml");
                response.send(svg);
            }
        })

        fastify.get<Schema>("/watermark/named.png", {
            schema,
            async handler(request, response) {
                const svg = await getSvg(request.query);
                const output = await sharp(Buffer.from(svg))
                    .png()
                    // .flatten({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
                    .toBuffer();
                response.header("Content-Type", "image/png");
                response.send(output);
            }
        })
    }
}