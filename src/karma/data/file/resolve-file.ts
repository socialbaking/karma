import {File, ResolvedFile} from "./types";
import {join} from "node:path";
import {DISCORD_MEDIA_OFFLINE_STORE, DISCORD_MEDIA_COMMUNITY_NAME} from "./discord";
import {R2_ACCESS_KEY_ID, R2_ACCESS_KEY_SECRET, R2_BUCKET, r2Config} from "./r2";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

import {ok} from "../../../is";
import {getOrigin} from "../../listen/config";
import {isNumberString} from "../../calculations";
import {packageIdentifier} from "../../package";

const {
    IMAGE_RESIZING_URL,
    IMAGE_RESIZING_DEFAULT_SIZE,
    IMAGE_RESIZING_DEFAULT_QUALITY,
    IMAGE_RESIZING_WATERMARK_ORIGIN
} = process.env;

// https://developers.cloudflare.com/images/image-resizing/url-format/#recommended-image-sizes
const DEFAULT_SIZE = 1920;
// From 1 to 100, default with Cloudflare is 85
const DEFAULT_QUALITY = 100;

const BASE_SIZE = 600;


const WATERMARK_CACHE_BUST = `4.${packageIdentifier}.${DISCORD_MEDIA_COMMUNITY_NAME}`;

export function getSize(given?: number): number {
    if (given) return given;
    if (isNumberString(IMAGE_RESIZING_DEFAULT_SIZE)) return +IMAGE_RESIZING_DEFAULT_SIZE;
    return DEFAULT_SIZE;
}

export function getQuality(given?: number): number {
    if (given) return given;
    if (isNumberString(IMAGE_RESIZING_DEFAULT_QUALITY)) return +IMAGE_RESIZING_DEFAULT_QUALITY;
    return DEFAULT_QUALITY;
}

export interface ResolveFileOptions {
    public?: boolean
    size?: number;
    quality?: number;
}

export async function getMaybeResolvedFile(file?: File, options?: ResolveFileOptions): Promise<ResolvedFile | undefined> {
    if (!file) return undefined;
    const { synced } = file;
    if (!synced) return undefined;
    const url = await getResolvedUrl(file, options);
    if (!url) return undefined;
    return {
        ...file,
        synced,
        url
    }
}

export async function getResolvedFile(file?: File, options?: ResolveFileOptions): Promise<ResolvedFile> {
    const resolved = await getMaybeResolvedFile(file, options);
    ok(resolved, `Expected file to be already resolved ${file.fileId}`)
    return resolved;
}

export async function getResolvedUrl(file: File, options?: ResolveFileOptions) {
    if (!options || (!options.public && !options.size)) return getDirectURL();
    if (!file.contentType?.startsWith("image")) return getDirectURL();
    if (file.synced === "disk") return getDirectURL();
    const watermarked = file.sizes?.find(size => size.watermark);
    const url = new URL(IMAGE_RESIZING_URL, getOrigin());
    const size = getSize(options.size);
    if (options.public && watermarked) {
        const watermarkedUrl = await getR2URL(watermarked.url);
        if (watermarked.width === size || watermarked.height === size) {
            return watermarkedUrl;
        }
        url.searchParams.set("image", watermarkedUrl);
    } else {
        url.searchParams.set("image", await getDirectURL());
    }

    url.searchParams.set("width", size.toString());
    url.searchParams.set("height", size.toString());
    url.searchParams.set("fit", "scale-down");
    url.searchParams.set("quality", getQuality(options.quality).toString());

    if (options.public && !watermarked) {
        const ratio = size / BASE_SIZE;
        const draw: Record<string, unknown>[] = [
            {
                url: new URL(`/public/watermark.png?cacheBust=${WATERMARK_CACHE_BUST}`, IMAGE_RESIZING_WATERMARK_ORIGIN || getOrigin()).toString(),
                repeat: true,
                opacity: 0.5,
                fit: "contain",
                width: 170 * ratio,
            }
        ];
        if (file.uploadedByUsername) {
            const url = new URL(`/api/version/1/products/watermark/named.png`, IMAGE_RESIZING_WATERMARK_ORIGIN || getOrigin());
            url.searchParams.set("cacheBust", WATERMARK_CACHE_BUST);
            url.searchParams.set("name", `Uploaded by ${file.uploadedByUsername}`);
            if (file.source === "discord" && DISCORD_MEDIA_COMMUNITY_NAME) {
                url.searchParams.set("community", DISCORD_MEDIA_COMMUNITY_NAME);
            }
            draw.push({
                url: url.toString(),
                bottom: 5,
                left: 0,
                // "0 0 630 90"
                // 630*(50/90) = 350
                width: 350 * ratio,
                fit: "contain",
                gravity: "left"
            });
        }
        // console.log(file, draw);
        url.searchParams.set("draw", JSON.stringify(draw))


    }

    return url.toString();

    async function getR2URL(url: string) {
        const { pathname } = new URL(url);
        const client = new S3Client(r2Config);
        let key = pathname.replace(/^\//, "");
        if (key.startsWith(`${R2_BUCKET}/`)) {
            // TODO remove, this was a bug 👀
            key = key.replace(`${R2_BUCKET}/`, "")
        }
        const command = new GetObjectCommand({
            Bucket: R2_BUCKET,
            Key: key
        });
        // Specify a custom expiry for the presigned URL, in seconds
        const expiresIn = 3600;
        return await getSignedUrl(client, command, { expiresIn });
    }

    async function getDirectURL() {
        if (file.synced === "disk") {
            if (file.source === "discord" && DISCORD_MEDIA_OFFLINE_STORE) {
                return `file://${join(process.cwd(), DISCORD_MEDIA_OFFLINE_STORE, file.fileName)}`
            }
            return `file://${file.fileName}`;
        }
        if (file.synced === "r2") {
            if (!(R2_ACCESS_KEY_ID && R2_ACCESS_KEY_SECRET)) {
                // Cannot get key if no key or secret
                return undefined;
            }
            return getR2URL(file.url);
        }
        return undefined;
    }
}