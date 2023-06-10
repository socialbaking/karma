import {S3Client, S3ClientConfig} from "@aws-sdk/client-s3";
import {ok} from "../../../is";

export const {
    R2_ACCESS_KEY_ID,
    R2_ACCESS_KEY_SECRET,
    R2_BUCKET,
    R2_ENDPOINT
} = process.env

export const r2Config: S3ClientConfig = {
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_ACCESS_KEY_SECRET,
    },
    endpoint: R2_ENDPOINT,
    region: "auto"
}

let r2Client: S3Client | undefined = undefined;

export async function getR2() {
    if (r2Client) return r2Client;
    ok(isR2(), "Expected R2 to be configured");
    const { S3Client } = await import("@aws-sdk/client-s3");
    r2Client = new S3Client(r2Config);
    return r2Client;
}

export function isR2() {
    return (
        R2_ACCESS_KEY_ID &&
        R2_ACCESS_KEY_SECRET &&
        R2_BUCKET &&
        R2_ENDPOINT
    )
}