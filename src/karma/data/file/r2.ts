import {S3ClientConfig} from "@aws-sdk/client-s3";

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