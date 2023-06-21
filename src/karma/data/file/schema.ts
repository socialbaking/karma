import { fileSchema } from "@opennetwork/logistics";

export const fileSize = fileSchema.fileSize;
export const fileData = fileSchema.fileData

export const file = {
    ...fileSchema.file,
    properties: {
        ...fileSchema.file.properties,
        productId: {
            type: "string",
            nullable: true
        }
    }
}