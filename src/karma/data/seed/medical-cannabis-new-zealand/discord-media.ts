import {DISCORD_BOT_TOKEN, DISCORD_SERVER_ID} from "../../../listen/auth/discord";
import {ok} from "../../../../is";
import {getProduct, listProducts, Product, ProductFile, setProduct} from "../../product";
import {listOrganisations} from "../../organisation";
import {getMatchingProducts} from "../../../utils";
import {listCategories} from "../../category";
import {v5} from "uuid";
import {extname, join} from "node:path";
import {mkdir, writeFile} from "fs/promises";
import {File, FileData, FileImageSize, FileSize, getFile, getNamedFile, listNamedFiles, setFile} from "../../file";
import {getTimeRemaining, isRequiredTimeRemaining, getSignal} from "../../../signal";
import {addExpiring, getCached} from "../../cache";
import {DAY_MS, getExpiresAt, MONTH_MS} from "../../storage";
import {R2_ACCESS_KEY_SECRET, R2_ACCESS_KEY_ID, R2_ENDPOINT, R2_BUCKET, r2Config, getR2, isR2} from "../../file";
import {
    DISCORD_MEDIA_OFFLINE_STORE,
    DISCORD_MEDIA_PARENT_CHANNEL_NAME,
    DISCORD_MEDIA_VERSION,
    DISCORD_MEDIA_PINNED_ONLY,
    DISCORD_MEDIA_EMOJI_NAME
} from "../../file";
import {createHash} from "crypto";
import {DEFAULT_IMAGE_SIZE, getResolvedUrl, getSize, ResolveFileOptions} from "../../file";
import {HeadObjectCommand, PutObjectCommand} from "@aws-sdk/client-s3";
import {basename} from "discord.js";
import {isNumberString} from "../../../calculations";

const namespace = "cb541dc3-ffbd-4d9c-923a-d1f4af02fa89";

const VERSION = +(DISCORD_MEDIA_VERSION || "20");
const RESIZE_VERSION = 23;

const { IS_LOCAL, DISABLE_EXISTING_FILE } = process.env;

const ENABLE_EXISTING_FILE = !DISABLE_EXISTING_FILE;

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
const DEFAULT_MAX_REQUESTS = IS_LOCAL ? 1000 : 45;
const DEFAULT_MAX_REQUESTS_PER_CHANNEL = IS_LOCAL ? 1000 : 35;

// This is the default for the discord API, but we need to be able to reference this
const MESSAGE_LIMIT_PER_REQUEST = 100;

// How much time we should give ourselves before finishing up
const TIMEOUT_BUFFER_MS = 5000;

// The reaction names that will be searched for
const DISCORD_MEDIA_EMOJI_NAMES = DISCORD_MEDIA_EMOJI_NAME?.split("/") ?? ["❤️", "🔥"];

const DISCORD_MEDIA_SIZES = [
  100,
  600,
  DEFAULT_IMAGE_SIZE
];


interface DiscordContext {
    requestsRemaining: number;
    requestsUsed: number;
    rateLimitUntil?: number;
    rateLimitTimeout?: number;
    onRateLimitResponse(response: Response): void;
}

export async function seedDiscordMedia() {

    if (!DISCORD_BOT_TOKEN) return;
    if (process.env.NO_DISCORD_MEDIA_SEED) return;

    console.log("seed discord media");

    let rateLimitedUntil: number | undefined = undefined;

    function createContext(initialRequests = DEFAULT_MAX_REQUESTS) {
        let requestsRemaining = initialRequests;
        let scopeLimitedUntil: number | undefined = undefined;
        const context: DiscordContext = {
            get requestsUsed() {
                return initialRequests - requestsRemaining;
            },
            get rateLimitUntil() {
                return rateLimitedUntil ?? scopeLimitedUntil
            },
            get rateLimitTimeout() {
                const until = context.rateLimitUntil;
                const timeout = until - Date.now();
                if (timeout <= 0) return undefined;
                return timeout;
            },
            get requestsRemaining() {
                const timeout = context.rateLimitTimeout;
                if (timeout) {
                    console.log("Request rate timeout", timeout);
                    return 0;
                }
                return requestsRemaining;
            },
            set requestsRemaining(value: number) {
                requestsRemaining = value;
            },
            onRateLimitResponse(response: Response) {
                /*
                'x-ratelimit-bucket' => {
                  name: 'x-ratelimit-bucket',
                  value: '1234567'
                },
                'x-ratelimit-limit' => { name: 'x-ratelimit-limit', value: '5' },
                'x-ratelimit-remaining' => { name: 'x-ratelimit-remaining', value: '0' },
                'x-ratelimit-reset' => { name: 'x-ratelimit-reset', value: '1686696069.471' },
                'x-ratelimit-reset-after' => { name: 'x-ratelimit-reset-after', value: '3.661' },
                 */
                console.log("Rate limited by discord", requestsRemaining);
                const rateLimitedUntilSeconds = response.headers.get("x-ratelimit-reset");
                ok(isNumberString(rateLimitedUntilSeconds), "Expected ratelimit reset to be a number");
                const currentRateLimitedUntil = (+rateLimitedUntilSeconds) * 1000;

                const scope = response.headers.get("x-ratelimit-scope") ?? "user";
                if (scope === "shared") {
                    scopeLimitedUntil = currentRateLimitedUntil;
                    console.log({ now: new Date().toISOString(), scopeLimitedUntil: new Date(scopeLimitedUntil).toISOString(), scopeLimitedFor: (scopeLimitedUntil - Date.now()) / 1000 });
                } else {
                    rateLimitedUntil = currentRateLimitedUntil;
                    console.log({ now: new Date().toISOString(), currentRateLimitedUntil: new Date(currentRateLimitedUntil).toISOString(), currentRateLimitedFor: (currentRateLimitedUntil - Date.now()) / 1000 });
                }

            }
        }
        return context;
    }

    const context: DiscordContext = createContext();

    let channels = await listProductChannels(context);

    if (!channels.length) {
        console.log("No channels matching product names");
    } else {
        console.log(channels.map(channel => `${channel.name}: ${channel.product.productName}`));
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

    let rateLimited: [ProductDiscordChannel, DiscordContext][] = []

    rateLimitLoop: do {
        let resolvedChannels = channels;
        if (rateLimited.length) {
            resolvedChannels = rateLimited
                .sort((a, b) => {
                    return (a[1].rateLimitTimeout ?? 0) < (b[1].rateLimitTimeout ?? 0) ? -1 : 1
                })
                .map((entry) => entry[0]);
        }
        const contexts = new Map(rateLimited);
        rateLimited = [];
        for (const channel of resolvedChannels) {
            console.log(`Seeding files for Discord channel ${channel.name}`);
            const initial = context.requestsRemaining;
            const givenRemaining = Math.min(initial, DEFAULT_MAX_REQUESTS_PER_CHANNEL);
            const nextContext = contexts.get(channel) ?? createContext(givenRemaining);

            if (!await rateLimitTimeout(nextContext)) {
                break rateLimitLoop;
            }

            if (!nextContext.requestsRemaining) {
                continue;
            }
            console.log(`Requests Remaining: ${context.requestsRemaining}`);
            await downloadMediaFromChannel(nextContext, channel);
            if (!isRequiredTimeRemaining(TIMEOUT_BUFFER_MS)) break;
            context.requestsRemaining -= nextContext.requestsUsed;
            if (context.requestsRemaining <= 0) break;
            if (context.rateLimitTimeout && nextContext.requestsUsed < givenRemaining) {
                rateLimited.push([channel, nextContext]);
            }
        }
    } while (rateLimited.length && isRequiredTimeRemaining(TIMEOUT_BUFFER_MS));

    console.log(`Requests Remaining: ${context.requestsRemaining}`);
}

async function rateLimitTimeout({ rateLimitTimeout: timeout }: DiscordContext) {
    if (!timeout) return isRequiredTimeRemaining(TIMEOUT_BUFFER_MS);
    if (!isRequiredTimeRemaining(timeout + TIMEOUT_BUFFER_MS)) {
        return false;
    }
    console.log("Waiting for rate limit timeout", timeout);
    await new Promise(resolve => setTimeout(resolve, timeout + 10));
    return isRequiredTimeRemaining(TIMEOUT_BUFFER_MS);
}

async function downloadMediaFromChannel(context: DiscordContext, channel: ProductDiscordChannel) {
    let anyProcessed = false;

    const files = await listNamedFiles("product", channel.product.productId);

    if (files.length) {
        const pending = files.filter(file => !file.syncedAt && (file.externalUrl || file.remoteUrl));
        if (pending.length) {
            console.log(`${pending.length} pending files for ${channel.name}`);
            anyProcessed = await saveFileData(context, pending);
            if (anyProcessed) {
                console.log(`Files processed for ${channel.name} from previous list`, context.requestsRemaining);
            } else {
                console.log(`Files not processed for ${channel.name} from previous list`, context.requestsRemaining);
            }
        }
    }

    if (context.requestsRemaining) {
        console.log(`Listing messages for channel ${channel.name}`);

        const pinnedMessages = await listPinnedMediaMessages(context, channel);

        if (pinnedMessages) {
            let pinnedFileIds: string[] = [];
            for (const message of pinnedMessages) {
                anyProcessed = true;

                const data = getFileData(channel, message);

                pinnedFileIds.push(...data.map(data => data.fileId));

                await saveFileData(
                    context,
                    data
                )

                await saveAttachments(context, channel, message);
            }

            const currentFiles = await listNamedFiles("product", channel.product.productId);
            const currentPinnedFiles = currentFiles.filter(file => file.pinned);
            const unpinnedFiles = currentPinnedFiles.filter(
                file => !pinnedFileIds.includes(file.fileId)
            );

            if (unpinnedFiles.length) {
                console.log(`Unpinning ${unpinnedFiles.length} files for ${channel.name}`);
                for (const file of unpinnedFiles) {
                    await setFile({
                        ...file,
                        pinned: false
                    });
                }
            }
        }

        for await (const messages of listMediaMessages(context, channel)) {
            // Fetch pinned messages with priority
            for (const message of messages.sort((a, b) => a.pinned ? (b.pinned ? 0 : -1) : 1)) {
                if (message.pinned) continue;
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

    let { finalSynced, finalFiles } = await listFiles();
    const finalPending = finalFiles.filter(file => !file.syncedAt && (file.remoteUrl || file.externalUrl));
    console.log(`Final count, ${finalPending.length} pending files, ${finalSynced.length} synced files for ${channel.name}`);

    await watermarkFiles(finalSynced);

    // HAVE MAKE SURE TO UPDATE OUR LIST IN BETWEEN!
    ({ finalSynced, finalFiles } = await listFiles());

    await fileReactions(context, finalSynced);

    // HAVE MAKE SURE TO UPDATE OUR LIST IN BETWEEN!
    ({ finalSynced, finalFiles } = await listFiles());

    await resizeFiles(finalSynced);

    async function listFiles() {
        const finalFiles = await listNamedFiles("product", channel.product.productId);
        const finalSynced = finalFiles.filter(file => file.syncedAt && (file.remoteUrl || file.externalUrl));
        return { finalFiles, finalSynced }
    }

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
        // Stable file ID
        const hash = createHash("sha512");
        [
            DISCORD_SERVER_ID,
            channel.id,
            message.id,
            attachment.id,
            attachment.filename
        ].forEach(value => hash.update(value));
        const fileId = hash.digest().toString("hex");
        const fileName = `${channel.name}-${v5(fileId, namespace)}${extname(attachment.filename)}`;

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
            sourceId: `${channel.id}:${message.id}:${attachment.id}`,
            version: VERSION,
            remoteUrl: attachment.url
        }
    })
}

async function saveAttachments(context: DiscordContext, channel: ProductDiscordChannel, message: DiscordMessage) {
    return saveFileData(
        context,
        getFileData(channel, message)
    );
}

async function isExistingInR2(file: FileData) {
    // Disable any functionality trying to use existing
    if (!ENABLE_EXISTING_FILE) return false;
    const client = await getR2();
    const externalKey = `discord/${file.fileName}`;
    const headCommand = new HeadObjectCommand({
        Key: externalKey,
        Bucket: R2_BUCKET,
    });
    try {
        await client.send(headCommand);
        return true;
    } catch {
        return false;
    }
}

async function saveToR2(file: FileData, blob: Blob): Promise<Partial<FileData>> {
    const client = await getR2()
    const externalKey = `discord/${file.fileName}`;

    const buffer = Buffer.from(await blob.arrayBuffer());
    const hash256 = createHash("sha256");
    hash256.update(buffer);
    const hash5 = createHash("md5");
    hash5.update(buffer);
    const checksum = {
        SHA256: hash256.digest().toString("base64"),
        MD5: hash5.digest().toString("base64")
    };

    const url = new URL(
        `/${externalKey}`,
        R2_ENDPOINT
    ).toString();

    if (await isExistingInR2(file)) {
        console.log(`Using existing uploaded file for ${file.fileName}`);
        return {
            synced: "r2",
            syncedAt: file.syncedAt || new Date().toISOString(),
            url,
            // Allow checksum to be updated if it wasn't present!
            checksum: {
                ...checksum,
                ...file.checksum
            }
        }
    }

    console.log(`Uploading file ${file.fileName} to R2`, checksum);

    const command = new PutObjectCommand({
        Key: externalKey,
        Bucket: R2_BUCKET,
        Body: buffer,
        ContentType: file.contentType,
        ContentMD5: checksum.MD5
    });

    const result = await client.send(command);
    return {
        synced: "r2",
        syncedAt: new Date().toISOString(),
        url,
        checksum: {
            ...checksum,
            ...getChecksum(result)
        }
    };
}

function getChecksum(result: { ChecksumCRC32?: string, ChecksumCRC32C?: string, ChecksumSHA1?: string, ChecksumSHA256?: string }) {
    if (!result.ChecksumSHA256) return undefined;
    console.log(`Checksum:`, result.ChecksumSHA256);
    return {
        CRC32: result.ChecksumCRC32,
        CRC32C: result.ChecksumCRC32C,
        SHA1: result.ChecksumSHA1,
        SHA256: result.ChecksumSHA256
    }
}

async function saveFileData(context: DiscordContext, fileData: IdFileData[]): Promise<boolean> {
    const path = DISCORD_MEDIA_OFFLINE_STORE;
    if (isR2()) {
        return await saveR2();
    } else if (path) {
        return await saveLocal();
    }
    return false;

    async function saveR2() {
        return saveFiles(saveToR2)
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
            return { synced: "disk", syncedAt: new Date().toISOString() }
        })
    }

    async function saveFiles(fn: (file: FileData, blob: Blob) => Promise<Partial<FileData>>): Promise<boolean> {
        let anyUpdates = false;
        for (const data of fileData) {
            if (DISCORD_MEDIA_PINNED_ONLY && !data.pinned) {
                continue;
            }

            if (MATCH_CONTENT_TYPE.length) {
                const found = MATCH_CONTENT_TYPE.find(type => data.contentType.startsWith(type));
                if (!found) {
                    continue;
                }
            }

            const isTimeRemaining = isRequiredTimeRemaining(TIMEOUT_BUFFER_MS);
            console.log(`Time remaining: ${getTimeRemaining()}, ${isTimeRemaining}`);
            const { productId, fileId, externalUrl, remoteUrl } = data;
            const resolvedUrl = remoteUrl || externalUrl;
            ok(typeof productId === "string", "Expected file data to have productId");
            ok(typeof resolvedUrl === "string", "Expected file data to have externalUrl");
            const existing = await getNamedFile("product", productId, fileId);
            if (existing?.syncedAt) {
                await setFile({
                    ...existing,
                    ...data,
                })
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
                    resolvedUrl,
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
                    const baseUpdate = {
                        ...((await fn(data, blob)) ?? undefined)
                    }
                    update = {
                        ...baseUpdate,
                        syncedAt: baseUpdate.syncedAt || new Date().toISOString()
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

async function listPinnedMediaMessages(context: DiscordContext, channel: DiscordGuildChannel): Promise<DiscordMessage[]> {
    const pinsUrl = new URL(
        `/api/v10/channels/${channel.id}/pins`,
        "https://discord.com"
    );
    const pinsResponse = await fetch(
        pinsUrl,
        {
            method: "GET",
            headers: {
                Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
            },
        }
    )
    console.log("listMediaMessages pins status:", pinsResponse.status);
    if (!pinsResponse.ok) {
        return undefined;
    }
    const pins: DiscordMessage[] = await pinsResponse.json();
    console.log({ pins: pins.length });
    return pins.filter(message => message.attachments?.length);
}

async function *listMediaMessages(context: DiscordContext, channel: DiscordGuildChannel): AsyncIterable<DiscordMessage[]> {
    // Done if only pins
    if (DISCORD_MEDIA_PINNED_ONLY) return;

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
            context.onRateLimitResponse(response);
            break;
        }
        if (!response.ok) {
            break;
        }
        // ok(response.ok, `listMediaMessages returned ${response.status}`);
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
    } while (responseMessages.length >= MESSAGE_LIMIT_PER_REQUEST && await rateLimitTimeout(context) && (context.requestsRemaining > 0));

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
    topic?: string;
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

    console.log(channels.length);


    ok(DISCORD_MEDIA_PARENT_CHANNEL_NAME, "Expected DISCORD_MEDIA_PARENT_CHANNEL_NAME");
    const parentName = decodeURIComponent(DISCORD_MEDIA_PARENT_CHANNEL_NAME).toLowerCase();
    let groupedChannels = channels
        .filter(({ parent }) => {
            if (!parent) return false;
            return parent.name.toLowerCase() === parentName;
        });

    if (!groupedChannels.length) {
        groupedChannels = channels
            .filter(({ parent }) => {
                if (!parent) return false;
                return parent.name.toLowerCase().includes(parentName);
            });
    }

    const matchingChannels = groupedChannels
        .map(channel => {
            const matching = getMatchingProducts(products, organisations, categories, channel.name.replace(/-/g, " "));
            if (matching.length !== 1) return undefined;
            return {
                ...channel,
                product: matching[0]
            }
        })
        .filter(Boolean);

    console.log({
        parentName,
        groupedChannels,
        matchingChannels,
        products
    })

    const remainingProducts = products.filter(product => {
        const found = matchingChannels.find(channel => channel.product.productId === product.productId);
        return !found;
    });
    const remainingChannels = groupedChannels.filter(channel => {
        const found = matchingChannels.find(other => other.id === channel.id);
        return !found;
    });
    const matchingTopics = remainingProducts
        .map(product => {
            // Find the topic where the product name matches in full
            const matchingTopic = remainingChannels.find(({ topic }) => topic?.includes(product.productName));
            if (!matchingTopic) return undefined;
            return {
                ...matchingTopic,
                product
            };
        })
        .filter(Boolean);
    return [...matchingChannels, ...matchingTopics];
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

async function watermarkFiles(files: File[]) {
    if (!isR2()) return; // Only watermark with R2
    const pinned = files.filter(file => file.pinned && file.contentType.startsWith("image"));
    if (!pinned.length) return;
    const DEFAULT_SIZE = getSize();
    const pending = pinned.filter(file => file.syncedAt && !file.sizes?.filter(Boolean).find(size => (
        size.width === DEFAULT_SIZE &&
        size.watermark &&
        size.version === RESIZE_VERSION
    )));
    while (isRequiredTimeRemaining(TIMEOUT_BUFFER_MS) && pending.length) {
        const file = pending.shift();
        console.log(`Fetching watermark image for ${file.fileName}`);
        const interim: File = {
            ...file,
            fileName: `watermark-${basename(file.fileName)}`,
            sizes: undefined
        }
        const resized = await resizeFile(interim, {
            public: true,
            size: DEFAULT_SIZE
        });
        if (!resized) {
            console.log("Could not resize for", file.fileName)
            continue;
        }
        // console.log({ resized });
        const nextFile: File = {
            ...file,
            sizes: [
                // Allow updating the watermark image
                ...(file.sizes ?? []).filter(Boolean).filter(value => !value.watermark),
                resized
            ]
        };
        await setFile(nextFile);
    }
}

async function getReactionCount(context: DiscordContext, channelId: string, messageId: string, emoji: string) {
    // console.log({ emoji, messageId, channelId });
    context.requestsRemaining -= 1;
    const response = await fetch(
        new URL(
            // /channels/{channel.id}/messages/{message.id}/reactions/{emoji}
            `/api/v10/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`,
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
    console.log(`getReactionCount status:`, response.status);
    if (response.status === 404) return undefined;
    if (response.status === 429) {
        context.onRateLimitResponse(response);
        return undefined;
    }
    if (!response.ok) {
        console.log(await response.text());
        return undefined;
    }
    // ok(response.ok, `listReactions returned ${response.status}`);
    const reactions: unknown[] = await response.json();
    if (reactions.length) {
        console.log({ [emoji]: reactions.length });
    }
    return reactions.length;
}

async function getFileReactionCount(context: DiscordContext, file: File, emoji: string) {
    if (!file.sourceId) return undefined;
    if (file.source !== "discord") return undefined;
    const [channelId, messageId] = file.sourceId.split(":");
    return getReactionCount(context, channelId, messageId, emoji);
}

async function fileReactions(context: DiscordContext, files: File[]) {

    for (const file of files) {
        if (!file.pinned) continue; // Only pinned files should get reaction counts checked
        if (!file.sourceId) continue;
        if (!context.requestsRemaining) break;
        if (!await rateLimitTimeout(context)) break;
        const remainingReactions = DISCORD_MEDIA_EMOJI_NAMES.filter(
            name => typeof file.reactionCounts?.[name] !== "number"
        );
        if (!remainingReactions.length) continue;

        const reactionCounts = Object.fromEntries(
            await Promise.all(
                remainingReactions.map(
                    async emoji => [emoji, await getFileReactionCount(context, file, emoji)] as const
                )
            )
        );

        const foundIndex = Object.values(reactionCounts).findIndex(value => typeof value === "number");
        if (foundIndex === -1) continue;

        // console.log(reactionCounts)

        const nextFile = {
            ...file,
            reactionCounts: {
                ...file.reactionCounts,
                ...reactionCounts
            },
            reactionCountsUpdatedAt: new Date().toISOString()
        };
        // console.log(nextFile);
        await setFile(nextFile);
    }
}

async function resizeFiles(files: File[]) {
    const pinned = files.filter(file => file.pinned && file.contentType.startsWith("image"));
    for (let file of pinned) {
        if (!isRequiredTimeRemaining(TIMEOUT_BUFFER_MS)) break;
        if (file.synced !== "r2") continue;

        // console.log({ before: file.sizes, version: RESIZE_VERSION });
        file = {
            ...file,
            sizes: (file.sizes ?? [])
                .filter(Boolean)
                .filter(value => value.version === RESIZE_VERSION)
        }
        // console.log({ after: file.sizes });

        const base = await resize(file);
        const watermarked = await resize(file, true);
        const updates = [
            ...base,
            ...watermarked
        ].filter(Boolean);

        // console.log({ updates });

        if (updates.length) {
            await setFile({
                ...file,
                sizes: [
                    ...file.sizes,
                    ...updates
                ]
            });
        }
    }

    async function resize(file: File, watermark?: boolean) {
        console.log(`Resizing ${watermark ? "watermark" : "base"} images for ${file.fileName}`);
        const sizes = DISCORD_MEDIA_SIZES.filter(
            size => !file.sizes?.filter(Boolean).find(value => value.width === size && (watermark ? value.watermark : !value.watermark))
        );
        if (!sizes.length) return [];
        // console.log({ sizes, file: file.sizes, watermark });
        const defaultSize = getSize();
        let url = file.url,
            fileName = file.fileName;
        if (watermark) {
            const watermarkSize = file.sizes
                ?.filter(Boolean)
                .find(value => value.width === defaultSize && value.watermark);
            if (!watermarkSize) return [];
            url = watermarkSize.url;
            fileName = watermarkSize.fileName ?? fileName;
        }
        if (!url) return [];
        return await Promise.all(
            sizes.map(
                async size => {
                    const resized = await resizeFile(
                        {
                            ...file,
                            url,
                            fileName
                        },
                        // No need to indicate public to the resizing process
                        { size }
                    );
                    if (!resized) return undefined;
                    if (watermark) {
                        resized.watermark = true;
                    }
                    return resized;
                }
            )
        );
    }

}

async function resizeFile(file: File, options: ResolveFileOptions) {
    const size = options.size;
    ok(size, "Expected size");
    const extension = extname(file.fileName);
    const withoutExtension = basename(file.fileName, extension)
    const withoutSize = withoutExtension.replace(/-\d+$/, "");
    const fileName = `${withoutSize}-${size}${extension}`;
    const fileData: FileData = {
        contentType: file.contentType,
        fileName
    };

    let saved: Partial<FileData>;
    // if (await isExistingInR2(fileData)) {
    //     console.log(`Resized photo already exists for ${fileData.fileName}, using quick save function`);
    //     saved = await saveToR2(fileData, new Blob([], { type: file.contentType }));
    // } else {
        console.log(`Fetching resized image for ${fileName} to size ${size} (public: ${options.public || false})`);
        const returnedUrl = await getResolvedUrl(
            {
                ...file,
                // Remove any available sizes, to ensure previous sized isn't used
                sizes: undefined
            },
            options
        );
        const response = await fetch(returnedUrl, {
            method: "GET",
            headers: {
                Accept: file.contentType
            }
        });
        console.log(`resizeFile status for ${fileName}:`, response.status);
        if (!response.ok) {
            console.log(response.headers.get("Cf-Resized"));
            console.log(response.headers);
            return undefined;
        }
        saved = await saveToR2(fileData, await response.blob());
    // }
    const {synced, syncedAt, url, checksum} = saved;
    const nextFileSize: FileSize = {
        // Either width or height will match
        height: size,
        width: size,
        synced,
        syncedAt,
        url,
        version: RESIZE_VERSION,
        fileName,
        checksum
    };
    if (options.public) {
        nextFileSize.watermark = true;
    }
    return nextFileSize;
}