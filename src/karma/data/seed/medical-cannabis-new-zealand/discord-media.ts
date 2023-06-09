import {DISCORD_BOT_TOKEN, DISCORD_SERVER_ID} from "../../../listen/auth/discord";
import {ok} from "../../../../is";
import {getProduct, listProducts, Product, ProductFile, setProduct} from "../../product";
import {listOrganisations} from "../../organisation";
import {getMatchingProducts} from "../../../utils";
import {listCategories} from "../../category";
import {v5} from "uuid";
import {extname, join} from "node:path";
import {mkdir, writeFile} from "fs/promises";
import {FileData, getFile, getNamedFile, listNamedFiles, setFile} from "../../file";
import {getTimeRemaining, isRequiredTimeRemaining, getSignal} from "../../../signal";
import {addExpiring, getCached} from "../../cache";
import {DAY_MS, getExpiresAt, MONTH_MS} from "../../storage";
import {R2_ACCESS_KEY_SECRET, R2_ACCESS_KEY_ID, R2_ENDPOINT, R2_BUCKET, r2Config} from "../../file/r2";
import {
    DISCORD_MEDIA_OFFLINE_STORE,
    DISCORD_MEDIA_DEBUG,
    DISCORD_MEDIA_PARENT_CHANNEL_NAME,
    DISCORD_MEDIA_VERSION
} from "../../file/discord";

const namespace = "cb541dc3-ffbd-4d9c-923a-d1f4af02fa89";

const VERSION = +(DISCORD_MEDIA_VERSION || "13");
const CACHE_KEY_PREFIX = `discord-media:${VERSION}`;

const MATCH_CONTENT_TYPE = ["image", "video"];

// Allow late expiry to allow for background tasks to be slow
// if wanted, should be replaced in this time
const CACHE_EXPIRES_IN_MS = 3 * DAY_MS;
// We should try rolling backwards every week or so just to make sure we
// Have the correctly pinned messages
const CACHE_DIRECTION_EXPIRES_IN_MS = 7 * DAY_MS;

// All bots can make up to 50 requests per second to our API.
// If no authorization header is provided, then the limit is applied to the IP address.
// This is independent of any individual rate limit on a route.
// If your bot gets big enough, based on its functionality,
// it may be impossible to stay below 50 requests per second during normal operations.

// We must keep some requests available for auth operations
const DEFAULT_MAX_REQUESTS = 45;
const DEFAULT_MAX_REQUESTS_PER_CHANNEL = 30;

// This is the default for the discord API, but we need to be able to reference this
const MESSAGE_LIMIT_PER_REQUEST = 100;

// How much time we should give ourselves before finishing up
const TIMEOUT_BUFFER_MS = 5000;

interface DiscordContext {
    requestsRemaining: number;
}

export async function seedDiscordMedia() {

    if (!DISCORD_BOT_TOKEN) return;

    const context: DiscordContext = {
        requestsRemaining: DEFAULT_MAX_REQUESTS
    }

    let channels = await listProductChannels(context);

    if (!channels.length) {
        console.log("No channels matching product names");
    } else {
        console.log(channels.map(channel => channel.name));
    }

    const sortOrder = new Map(
        channels.map((channel) => [channel, Math.random()] as const)
    );
    // Give a random sort to allow for all channels to have a chance to be fully seeded with images
    // Over time all the images will be resolved and this won't matter
    //
    // But when doing initial seeding it does
    channels = channels.sort(
        (a, b) => sortOrder.get(a) < sortOrder.get(b) ?  -1 : 1
    );
    for (const channel of channels) {
        console.log(`Seeding files for Discord channel ${channel.name}`);
        const initial = context.requestsRemaining;
        const givenRemaining = Math.min(initial, DEFAULT_MAX_REQUESTS_PER_CHANNEL);
        const nextContext = {
            ...context,
            requestsRemaining: givenRemaining
        };
        console.log(`Requests Remaining: ${context.requestsRemaining}`);
        await downloadMediaFromChannel(nextContext, channel);
        if (context.requestsRemaining <= 0) break;
        const used = givenRemaining - Math.max(0, nextContext.requestsRemaining);
        context.requestsRemaining -= used;
    }

    console.log(`Requests Remaining: ${context.requestsRemaining}`);
}

async function downloadMediaFromChannel(context: DiscordContext, channel: ProductDiscordChannel) {
    let anyProcessed = false;

    const files = await listNamedFiles("product", channel.product.productId);

    if (files.length) {
        const pending = files.filter(file => !file.synced && file.externalUrl);
        if (pending.length) {
            console.log(`${pending.length} pending files for ${channel.name}`);
            anyProcessed = await saveFileData(context, pending);
            if (anyProcessed) {
                console.log(`Files processed for ${channel.name} from previous list`, context);
            } else {
                console.log(`Files not processed for ${channel.name} from previous list`, context);
            }
        }
    }

    if (context.requestsRemaining) {
        console.log(`Listing messages for channel ${channel.name}`);
        for await (const messages of listMediaMessages(context, channel)) {
            // Fetch pinned messages with priority
            for (const message of messages.sort((a, b) => a.pinned ? (b.pinned ? 0 : -1) : 1)) {
                anyProcessed = true;
                await saveAttachments(context, channel, message);
            }
        }
    } else {
        console.log("No requests remaining, not trying listing additional messages for channel", channel.name);
    }

    if (!anyProcessed) {
        console.log(`Did not process any messages for channel ${channel.name}`);
    }

    const finalFiles = await listNamedFiles("product", channel.product.productId);
    const finalPending = finalFiles.filter(file => !file.synced && file.externalUrl);
    console.log(`Final count, ${finalPending.length} pending files for ${channel.name}`);
}

function getAuthorUsername(message: Pick<DiscordMessage, "author">) {
    const { author } = message;
    if (!author.discriminator || author.discriminator === "0" || author.discriminator === "0000") {
        return author.username;
    }
    return `${author.username}#${author.discriminator}`;
}

type IdFileData = FileData & { fileId: string };

function getFileData(channel: ProductDiscordChannel, message: DiscordMessage) {
    const uploadedByUsername = getAuthorUsername(message);
    const { product } = channel;
    return message.attachments.map((attachment): IdFileData => {

        const key = [
            DISCORD_SERVER_ID,
            channel.id,
            message.id,
            attachment.id,
            attachment.filename
        ].join(":");

        // Stable file ID
        const fileId = v5(`file:${key}`, namespace);
        const fileName = `${channel.name}-${v5(key, namespace)}${extname(attachment.filename)}`;

        return {
            fileId,
            type: "product",
            productId: product.productId,
            fileName,
            size: attachment.size,
            contentType: attachment.content_type,
            uploadedAt: new Date(message.timestamp).toISOString(),
            uploadedByUsername,
            pinned: !!message.pinned,
            source: "discord",
            version: VERSION,
            externalUrl: attachment.url
        }
    })
}

async function saveAttachments(context: DiscordContext, channel: ProductDiscordChannel, message: DiscordMessage) {
    return saveFileData(
        context,
        getFileData(channel, message)
    );
}

async function saveFileData(context: DiscordContext, fileData: IdFileData[]): Promise<boolean> {
    const path = DISCORD_MEDIA_OFFLINE_STORE;
    if (R2_ACCESS_KEY_ID && R2_ACCESS_KEY_SECRET && R2_BUCKET && R2_ENDPOINT) {
        return await saveR2();
    } else if (path) {
        return await saveLocal();
    }
    return false;

    async function saveR2() {
        const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
        const client = new S3Client(r2Config);
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
                    `/${externalKey}`,
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

    async function saveFiles(fn: (file: FileData, blob: Blob) => Promise<Partial<FileData>>): Promise<boolean> {
        let anyUpdates = false;
        for (const data of fileData) {
            if (MATCH_CONTENT_TYPE.length) {
                const found = MATCH_CONTENT_TYPE.find(type => data.contentType.startsWith(type));
                if (!found) {
                    continue;
                }
            }

            const isTimeRemaining = isRequiredTimeRemaining(TIMEOUT_BUFFER_MS);
            console.log(`Time remaining: ${getTimeRemaining()}, ${isTimeRemaining}`);
            const { productId, fileId, externalUrl } = data;
            ok(typeof productId === "string", "Expected file data to have productId");
            ok(typeof externalUrl === "string", "Expected file data to have externalUrl");
            const existing = await getNamedFile("product", productId, fileId);
            if (existing && (!isTimeRemaining || existing?.syncedAt) && !DISCORD_MEDIA_DEBUG) {
                // Only use if version matches
                // Allows re-fetching
                if (existing.version === VERSION) {
                    continue;
                }
            }
            let update: Partial<FileData>;
            if (isTimeRemaining) {
                // It appears that the discord image urls are not rate limited
                // As requesting multiple files results in 200s with no problems.
                const response = await fetch(
                    externalUrl,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                            Accept: data.contentType
                        },
                        signal: getSignal()
                    }
                );
                console.log(`saveAttachments status for ${data.fileName}:`, response.status);
                if (response.ok) {
                    const blob = await response.blob();
                    update = {
                        ...((await fn(data, blob)) ?? undefined),
                        syncedAt: new Date().toISOString()
                    };
                    anyUpdates = true;
                }
            } else {
                console.log(`Not fetching for ${data.fileName}`)
            }
            await setFile({
                ...data,
                ...update,
                fileId
            });
        }
        return anyUpdates;
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
    const beforeCacheKey = `${CACHE_KEY_PREFIX}:${channel.id}:listMediaMessages:before`;
    const directionCacheKey = `${CACHE_KEY_PREFIX}:${channel.id}:listMediaMessages:direction`;
    const messageAfter = await getCached(afterCacheKey, true);
    const messageBefore = await getCached(beforeCacheKey, true);

    let direction = (await getCached(directionCacheKey, true)) ?? "back";

    // console.log({ messageAfter });

    type MessageWithMS = DiscordMessage & { milliseconds: number }
    let mostRecentMessage: MessageWithMS | undefined = undefined,
        mostDistantMessage: MessageWithMS | undefined = undefined;

    url.searchParams.set("limit", MESSAGE_LIMIT_PER_REQUEST.toString());

    do {
        if (direction === "forward") {
            // We're going forward
            if (mostRecentMessage) {
                url.searchParams.set("after", mostRecentMessage.id);
            } else if (messageAfter) {
                url.searchParams.set("after", messageAfter);
            }
        } else {
            // We're going back
            if (mostDistantMessage) {
                url.searchParams.set("before", mostDistantMessage.id);
            } else if (messageBefore) {
                url.searchParams.set("before", messageBefore);
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
        console.log("listMediaMessages status:", response.status);
        if (response.status === 404) break;
        if (response.status === 429) {
            context.requestsRemaining = 0;
            break;
        }
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
        if (!responseMessages.length && direction !== "forward") {
            direction = "forward";
            console.log(`Have reached the end of the messages for ${channel.name}, switching direction to ${direction}`);
            await addExpiring({
                key: directionCacheKey,
                value: direction,
                expiresAt: getExpiresAt(CACHE_DIRECTION_EXPIRES_IN_MS),
                stable: true,
                role: false
            });
        } else {
            setMostRecent(responseMessages.at(-1));
            setDistantRecent(responseMessages.at(0));
        }
        // console.log({ mostDistantMessage, mostRecentMessage });
        const messages = responseMessages.filter(message => message.attachments?.length);
        if (messages.length) {
            yield messages;
        }
    } while (responseMessages.length >= MESSAGE_LIMIT_PER_REQUEST && (context.requestsRemaining > 0));


    if (mostRecentMessage) {
        await addExpiring({
            key: afterCacheKey,
            value: mostRecentMessage.id,
            role: false,
            stable: true,
            expiresAt: getExpiresAt(CACHE_EXPIRES_IN_MS)
        });
    }
    if (mostDistantMessage) {
        await addExpiring({
            key: beforeCacheKey,
            value: mostDistantMessage.id,
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
            signal: getSignal()
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