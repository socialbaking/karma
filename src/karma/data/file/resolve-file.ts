import {File, ResolvedFile} from "./types";
import {join} from "node:path";
import {DISCORD_MEDIA_OFFLINE_STORE} from "./discord";
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
    IMAGE_RESIZING_WATERMARK_ORIGIN
} = process.env;

const DEFAULT_SIZE = 800;
const DEFAULT_QUALITY = 0.9;

const WATERMARK_CACHE_BUST = `4.${packageIdentifier}`;

export function getSize(given?: number): number {
    if (given) return given;
    if (isNumberString(IMAGE_RESIZING_DEFAULT_SIZE)) return +IMAGE_RESIZING_DEFAULT_SIZE;
    return DEFAULT_SIZE;
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
    if (options.public && watermarked) {
        url.searchParams.set("image", await getR2URL(watermarked.url));
    } else {
        url.searchParams.set("image", await getDirectURL());
    }
    const size = getSize(options.size).toString();

    url.searchParams.set("width", size);
    url.searchParams.set("height", size);
    url.searchParams.set("fit", "contain");
    url.searchParams.set("quality", (options.quality || DEFAULT_QUALITY).toString());

    if (options.public && !watermarked) {
        url.searchParams.set("draw", JSON.stringify([
            {
                url: new URL(`/public/watermark.png?cacheBust=${WATERMARK_CACHE_BUST}`, IMAGE_RESIZING_WATERMARK_ORIGIN || getOrigin()).toString(),
                repeat: true,
                opacity: 0.5
            }
        ]))
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