import {DISCORD_BOT_TOKEN, DISCORD_SERVER_ID} from "../../../listen/auth/discord";
import {ok} from "../../../../is";
import {getProduct, listProducts, Product, ProductFile, setProduct} from "../../product";
import {listOrganisations} from "../../organisation";
import {getMatchingProducts} from "../../../utils";
import {listCategories} from "../../category";
import {v5} from "uuid";
import {extname, join} from "node:path";
import {mkdir, writeFile} from "fs/promises";
import {createWriteStream} from "fs";
import { pipeline } from "stream/promises";
import {FileData, getFile, setFile} from "../../file";
import {S3} from "@aws-sdk/client-s3";
import {getTimeRemaining} from "../../../signal";

const namespace = "cb541dc3-ffbd-4d9c-923a-d1f4af02fa89";

const {
    R2_ACCESS_KEY_ID,
    R2_ACCESS_KEY_SECRET,
    R2_BUCKET,
    R2_ENDPOINT,
    DISCORD_MEDIA_OFFLINE_STORE,
    DISCORD_DEBUG_MEDIA
} = process.env

export async function seedDiscordMedia() {

    if (!DISCORD_BOT_TOKEN) return;

    const channels = await listProductChannels();

    console.log(channels.map(channel => channel.name));

    for (const channel of channels) {
        await downloadMediaFromChannel(channel);
    }

}

async function downloadMediaFromChannel(channel: ProductDiscordChannel) {
    for await (const messages of listMediaMessages(channel)) {
        for (const message of messages) {
            await saveAttachments(channel, message);
        }
    }
}

function getAuthorUsername(message: DiscordMessage) {
    const { author } = message;
    if (!author.discriminator || author.discriminator === "0" || author.discriminator === "0000") {
        return author.username;
    }
    return `${author.username}#${author.discriminator}`;
}

async function saveAttachments(channel: ProductDiscordChannel, message: DiscordMessage) {
    // console.log(message);
    const { product } = channel
    const path = DISCORD_MEDIA_OFFLINE_STORE;
    let files: ProductFile[] = [];
    if (R2_ACCESS_KEY_ID && R2_ACCESS_KEY_SECRET && R2_BUCKET && R2_ENDPOINT) {
        files = await saveR2();
    } else if (path) {
        files = await saveLocal();
    }
    if (files.length) {
        const existing = await getProduct(product.productId);
        const fileIds = files.map(({ fileId }) => fileId);
        const existingFiles = existing.files?.filter(file => !fileIds.includes(file.fileId)) ?? []
        await setProduct({
            ...existing,
            files: existingFiles.concat(
                files.map(({ fileId, pinned }) => ({ fileId, pinned }))
            )
        });
        console.log(`Added ${files.length} files for ${product.productName}`);
    }

    async function saveR2(): Promise<ProductFile[]> {
        const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
        const client = new S3Client({
            credentials: {
                accessKeyId: R2_ACCESS_KEY_ID,
                secretAccessKey: R2_ACCESS_KEY_SECRET,
            },
            endpoint: R2_ENDPOINT,
            region: "auto"
        })
        return saveFiles(async (file, blob) => {
            const externalKey = `discord/${file.fileName}`;
            const command = new PutObjectCommand({
                Key: externalKey,
                Bucket: R2_BUCKET,
                Body: Buffer.from(await blob.arrayBuffer()),
                ContentType: file.contentType,
            });
            await client.send(command);
            return {
                url: new URL(
                    `/${R2_BUCKET}/${externalKey}`,
                    R2_ENDPOINT
                ).toString()
            }
        })
    }

    async function saveLocal(): Promise<ProductFile[]> {
        await mkdir(path, {
            recursive: true
        });
        return saveFiles(async (file, blob) => {
            await writeFile(
                join(path, file.fileName),
                Buffer.from(
                    await blob.arrayBuffer()
                )
            );
        })
    }

    async function saveFiles(fn: (file: FileData, blob: Blob) => Promise<Partial<FileData> | undefined | void>): Promise<ProductFile[]> {
        const uploadedByUsername = getAuthorUsername(message);
        const files: ProductFile[] = [];
        for (const attachment of message.attachments) {
            const isTimeRemaining = getTimeRemaining() > 2500;
            const key = `${DISCORD_SERVER_ID}:${channel.id}:${message.id}:${attachment.filename}`;
            // Stable file ID
            const fileId = v5(`file:${key}`, namespace);
            const existing = await getFile(fileId);
            if (existing && (!isTimeRemaining || existing?.syncedAt) && !DISCORD_DEBUG_MEDIA) {
                files.push(existing);
                continue;
            }
            const fileName = `${channel.name}-${v5(key, namespace)}${extname(attachment.filename)}`;
            const data: FileData = {
                fileName,
                size: attachment.size,
                contentType: attachment.content_type,
                uploadedAt: new Date(message.timestamp).toISOString(),
                uploadedByUsername,
                pinned: !!message.pinned
            }
            let update: Partial<FileData>;
            if (getTimeRemaining() > 2500) {
                const response = await fetch(
                    attachment.url,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                            Accept: attachment.content_type
                        },
                    }
                );
                const blob = await response.blob();
                update = {
                    ...((await fn(data, blob)) ?? undefined),
                    syncedAt: new Date().toISOString()
                };
            }
            const file = await setFile({
                ...data,
                ...update,
                fileId
            });
            files.push(file);
        }
        return files;
    }
}

async function *listMediaMessages(channel: DiscordGuildChannel): AsyncIterable<DiscordMessage[]> {
    const url = new URL(
        `/api/v10/channels/${channel.id}/messages`,
        "https://discord.com"
    );
    url.searchParams.set("limit", "100");
    let responseMessages: DiscordMessage[] = [];
    do {
        if (responseMessages.length) {
            url.searchParams.set("before", responseMessages.at(-1).id)
        }
        const response = await fetch(
            url,
            {
                method: "GET",
                headers: {
                    Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                },
            }
        );
        if (response.status === 404) return undefined;
        ok(response.ok, `listMediaMessages returned ${response.status}`);
        responseMessages = await response.json();
        const messages = responseMessages.filter(message => message.attachments?.length);
        if (messages.length) {
            yield messages;
        }
    } while (responseMessages.length);
}

interface DiscordAttachment {
    id: string;
    filename: string;
    size: number;
    url: string;
    proxy_url?: string;
    width?: number;
    height?: number;
    content_type: string;
}

interface DiscordAuthor {
    id: string;
    username: string;
    global_name: string;
    discriminator?: string;
}

interface DiscordMessage {
    id: string;
    timestamp: string;
    pinned: boolean;
    type: number;
    content: string;
    author: DiscordAuthor;
    attachments: DiscordAttachment[];
}

interface DiscordGuildChannel extends Record<string, unknown> {
    id: string;
    name: string;
    type: string;
}

interface ProductDiscordChannel extends DiscordGuildChannel {
    product: Product
}

async function listProductChannels(): Promise<ProductDiscordChannel[]> {
    const channels = await listGuildChannels();
    const products = await listProducts();
    const organisations = await listOrganisations();
    const categories = await listCategories();
    return channels
        .map(channel => {
            const matching = getMatchingProducts(products, organisations, categories, channel.name.replace(/-/g, " "));
            if (matching.length !== 1) return undefined;
            return {
                ...channel,
                product: matching[0]
            }
        })
        .filter(Boolean);
}

async function listGuildChannels(): Promise<DiscordGuildChannel[]> {
    const response = await fetch(
        new URL(
            `/api/v10/guilds/${DISCORD_SERVER_ID}/channels`,
            "https://discord.com"
        ),
        {
            method: "GET",
            headers: {
                Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
            },
        }
    );
    if (response.status === 404) return undefined;
    ok(response.ok, `listGuildChannels returned ${response.status}`);
    return response.json();
}