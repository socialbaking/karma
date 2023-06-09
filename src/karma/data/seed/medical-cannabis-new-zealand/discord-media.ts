import {DISCORD_BOT_TOKEN, DISCORD_SERVER_ID} from "../../../listen/auth/discord";
import {ok} from "../../../../is";
import {getProduct, listProducts, Product, ProductFile, setProduct} from "../../product";
import {listOrganisations} from "../../organisation";
import {getMatchingProducts} from "../../../utils";
import {listCategories} from "../../category";
import {v5} from "uuid";
import {extname, join} from "node:path";
import {mkdir, writeFile} from "fs/promises";
import {FileData, getFile, getNamedFile, setFile} from "../../file";
import {getTimeRemaining} from "../../../signal";
import {addExpiring, getCached} from "../../cache";
import {DAY_MS, getExpiresAt} from "../../storage";

const namespace = "cb541dc3-ffbd-4d9c-923a-d1f4af02fa89";

const VERSION = 6;
const CACHE_KEY_PREFIX = `discord-media:${VERSION}`;

// Allow late expiry to allow for background tasks to be slow
// if wanted, should be replaced in this time
const CACHE_EXPIRES_IN_MS = 3 * DAY_MS;

// All bots can make up to 50 requests per second to our API.
// If no authorization header is provided, then the limit is applied to the IP address.
// This is independent of any individual rate limit on a route.
// If your bot gets big enough, based on its functionality,
// it may be impossible to stay below 50 requests per second during normal operations.

// We must keep some requests available for auth operations
const DEFAULT_MAX_REQUESTS = 35;

const {
    R2_ACCESS_KEY_ID,
    R2_ACCESS_KEY_SECRET,
    R2_BUCKET,
    R2_ENDPOINT,
    DISCORD_MEDIA_OFFLINE_STORE,
    DISCORD_MEDIA_PARENT_CHANNEL_NAME,
    DISCORD_MEDIA_DEBUG,
} = process.env

interface DiscordContext {
    requestsRemaining: number;
}

export async function seedDiscordMedia() {

    if (!DISCORD_BOT_TOKEN) return;

    const context: DiscordContext = {
        requestsRemaining: DEFAULT_MAX_REQUESTS
    }

    const channels = await listProductChannels(context);

    console.log(channels.map(channel => channel.name));

    for (const channel of channels) {
        console.log(`Requests Remaining: ${context.requestsRemaining}`);
        await downloadMediaFromChannel(context, channel);
    }

    console.log(`Requests Remaining: ${context.requestsRemaining}`);
}

async function downloadMediaFromChannel(context: DiscordContext, channel: ProductDiscordChannel) {
    for await (const messages of listMediaMessages(context, channel)) {
        for (const message of messages) {
            await saveAttachments(context, channel, message);
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

async function saveAttachments(context: DiscordContext, channel: ProductDiscordChannel, message: DiscordMessage) {
    // console.log(message);
    const { product } = channel
    const path = DISCORD_MEDIA_OFFLINE_STORE;
    if (R2_ACCESS_KEY_ID && R2_ACCESS_KEY_SECRET && R2_BUCKET && R2_ENDPOINT) {
        await saveR2();
    } else if (path) {
        await saveLocal();
    }

    async function saveR2() {
        const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
        const client = new S3Client({
            credentials: {
                accessKeyId: R2_ACCESS_KEY_ID,
                secretAccessKey: R2_ACCESS_KEY_SECRET,
            },
            endpoint: R2_ENDPOINT,
            region: "auto"
        })
        return saveFiles(async (file, blob): Promise<Partial<FileData>> => {
            const externalKey = `discord/${file.fileName}`;
            const command = new PutObjectCommand({
                Key: externalKey,
                Bucket: R2_BUCKET,
                Body: Buffer.from(await blob.arrayBuffer()),
                ContentType: file.contentType,
            });
            await client.send(command);
            return {
                synced: "r2",
                url: new URL(
                    `/${R2_BUCKET}/${externalKey}`,
                    R2_ENDPOINT
                ).toString()
            }
        })
    }

    async function saveLocal() {
        await mkdir(path, {
            recursive: true
        });
        return saveFiles(async (file, blob): Promise<Partial<FileData>> => {
            await writeFile(
                join(path, file.fileName),
                Buffer.from(
                    await blob.arrayBuffer()
                )
            );
            return { synced: "disk" }
        })
    }

    async function saveFiles(fn: (file: FileData, blob: Blob) => Promise<Partial<FileData>>): Promise<void> {
        const uploadedByUsername = getAuthorUsername(message);
        for (const attachment of message.attachments) {
            const isTimeRemaining = getTimeRemaining() > 2500;
            const key = `${DISCORD_SERVER_ID}:${channel.id}:${message.id}:${attachment.filename}`;
            // Stable file ID
            const fileId = v5(`file:${key}`, namespace);
            const existing = await getNamedFile("product", product.productId, fileId);
            if (existing && (!isTimeRemaining || existing?.syncedAt) && !DISCORD_MEDIA_DEBUG) {
                // Only use if version matches
                // Allows re-fetching
                if (existing.version === VERSION) {
                    continue;
                }
            }
            const fileName = `${channel.name}-${v5(key, namespace)}${extname(attachment.filename)}`;
            const data: FileData = {
                type: "product",
                productId: product.productId,
                fileName,
                size: attachment.size,
                contentType: attachment.content_type,
                uploadedAt: new Date(message.timestamp).toISOString(),
                uploadedByUsername,
                pinned: !!message.pinned,
                source: "discord",
                version: VERSION
            };
            let update: Partial<FileData>;
            if (getTimeRemaining() > 2500 && context.requestsRemaining > 0) {
                context.requestsRemaining -= 1;
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
                if (response.status === 429) {
                    context.requestsRemaining = 0;
                }
                if (response.ok) {
                    const blob = await response.blob();
                    update = {
                        ...((await fn(data, blob)) ?? undefined),
                        syncedAt: new Date().toISOString()
                    };
                } else if (existing) {
                    continue;
                }
            }
            await setFile({
                ...data,
                ...update,
                fileId
            });
        }
    }
}

async function *listMediaMessages(context: DiscordContext, channel: DiscordGuildChannel): AsyncIterable<DiscordMessage[]> {
    const url = new URL(
        `/api/v10/channels/${channel.id}/messages`,
        "https://discord.com"
    );
    url.searchParams.set("limit", "100");
    let responseMessages: MessageWithMS[] = [];

    const afterCacheKey = `${CACHE_KEY_PREFIX}:${channel.id}:listMediaMessages:after`;
    const messageAfter = await getCached(afterCacheKey, true);

    // console.log({ messageAfter });

    type MessageWithMS = DiscordMessage & { milliseconds: number }
    let mostRecentMessage: MessageWithMS | undefined = undefined,
        mostDistantMessage: MessageWithMS | undefined = undefined;

    do {
        if (messageAfter) {
            // We're going forward
            if (mostRecentMessage) {
                url.searchParams.set("after", mostRecentMessage.id);
            } else {
                url.searchParams.set("after", messageAfter)
            }
        } else {
            // We're going back
            if (mostDistantMessage) {
                url.searchParams.set("before", mostDistantMessage.id);
            }
        }
        context.requestsRemaining -= 1;
        const response = await fetch(
            url,
            {
                method: "GET",
                headers: {
                    Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                },
            }
        );
        if (response.status === 404) break;
        if (response.status === 429) break; // Finish for now, we can try again later
        ok(response.ok, `listMediaMessages returned ${response.status}`);
        responseMessages = await response.json();
        responseMessages = responseMessages
            .map(message => ({
                ...message,
                milliseconds: new Date(message.timestamp).getTime()
            }))
            // I'm not sure how discord sorts, but let's just force consistency
            .sort(({ milliseconds: a }, { milliseconds: b }) => {
                return a < b ? -1 : 1
            });
        setMostRecent(responseMessages.at(-1));
        setDistantRecent(responseMessages.at(0));
        // console.log({ mostDistantMessage, mostRecentMessage });
        const messages = responseMessages.filter(message => message.attachments?.length);
        if (messages.length) {
            yield messages;
        }
    } while (responseMessages.length && context.requestsRemaining > 0)

    if (mostRecentMessage) {
        await addExpiring({
            key: afterCacheKey,
            value: mostRecentMessage.id,
            role: false,
            stable: true,
            expiresAt: getExpiresAt(CACHE_EXPIRES_IN_MS)
        });
    }

    function setMostRecent(given?: MessageWithMS) {
        if (!given) return;
        if (!mostRecentMessage) {
            mostRecentMessage = given;
        } else if (mostRecentMessage.milliseconds < given.milliseconds) {
            mostRecentMessage = given;
        }
    }
    function setDistantRecent(given?: MessageWithMS) {
        if (!given) return;
        if (!mostDistantMessage) {
            mostDistantMessage = given;
        } else if (mostDistantMessage.milliseconds > given.milliseconds) {
            mostDistantMessage = given;
        }
    }
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
    parent_id?: string;
    parent?: DiscordGuildChannel
    name: string;
    type: string;
}

interface ProductDiscordChannel extends DiscordGuildChannel {
    product: Product
}

async function listProductChannels(context: DiscordContext): Promise<ProductDiscordChannel[]> {
    const channels = await listGuildChannels(context);
    const products = await listProducts();
    const organisations = await listOrganisations();
    const categories = await listCategories();
    ok(DISCORD_MEDIA_PARENT_CHANNEL_NAME, "Expected DISCORD_MEDIA_PARENT_CHANNEL_NAME");
    const parentName = DISCORD_MEDIA_PARENT_CHANNEL_NAME.toLowerCase();
    return channels
        .filter(({ parent }) => {
            if (!parent) return false;
            return parent.name.toLowerCase() === parentName;
        })
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

async function listGuildChannels(context: DiscordContext): Promise<DiscordGuildChannel[]> {
    context.requestsRemaining -= 1;
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
    const channels: DiscordGuildChannel[] = await response.json();
    return channels.map(channel => {
        if (!channel.parent_id) return channel;
        const parent = channels.find(other => other.id === channel.parent_id);
        return {
            ...channel,
            parent
        };
    })
}