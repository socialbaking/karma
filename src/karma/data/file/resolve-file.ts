import {File, ResolvedFile} from "./types";
import {join} from "node:path";
import {DISCORD_MEDIA_OFFLINE_STORE} from "./discord";
import {R2_ACCESS_KEY_ID, R2_ACCESS_KEY_SECRET, R2_BUCKET, r2Config} from "./r2";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

import {ok} from "../../../is";
import {getOrigin} from "../../listen/config";

const {
    IMAGE_RESIZING_URL,
    IMAGE_RESIZING_DEFAULT_VARIANT,
    IMAGE_RESIZING_WATERMARK_ORIGIN
} = process.env;

export interface ResolveFileOptions {
    public?: boolean
    variant?: string;
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
    const directURL = await getDirectURL();
    if (!options) return directURL;
    if (!options.public && !options.variant) return directURL;
    if (!file.contentType?.startsWith("image")) return directURL;
    if (directURL.startsWith("file://")) return directURL;
    const url = new URL(IMAGE_RESIZING_URL, getOrigin());
    url.searchParams.set("image", directURL);
    const variant = options.variant || IMAGE_RESIZING_DEFAULT_VARIANT || "512";
    // &width=120&height=120&fit=contain&quality=0.2
    url.searchParams.set("width", variant);
    url.searchParams.set("height", variant);
    url.searchParams.set("fit", "contain");
    url.searchParams.set("quality", "0.8");
    url.searchParams.set("variant", variant);

    if (options.public) {
        url.searchParams.set("draw", JSON.stringify([
            {
                url: new URL("/public/watermark.png?cacheBust=5", IMAGE_RESIZING_WATERMARK_ORIGIN || getOrigin()).toString(),
                repeat: true,
                opacity: 0.5
            }
        ]))
    }

    return url.toString();

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
            const { pathname } = new URL(file.url);
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
        return undefined;
    }
}