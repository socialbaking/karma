import {File, ResolvedFile} from "./types";
import {join} from "node:path";
import {DISCORD_MEDIA_OFFLINE_STORE} from "./discord";
import {R2_ACCESS_KEY_ID, R2_ACCESS_KEY_SECRET, R2_BUCKET, r2Config} from "./r2";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

import {ok} from "../../../is";

export async function getMaybeResolvedFile(file?: File): Promise<ResolvedFile | undefined> {
    if (!file) return undefined;
    const { synced } = file;
    if (!synced) return undefined;
    const url = await getResolvedUrl(file);
    if (!url) return undefined;
    return {
        ...file,
        synced,
        url
    }
}

export async function getResolvedFile(file?: File): Promise<ResolvedFile> {
    const resolved = await getMaybeResolvedFile(file);
    ok(resolved, `Expected file to be already resolved ${file.fileId}`)
    return resolved;
}

export async function getResolvedUrl(file: File) {
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