import {getNamedFile, listNamedFiles} from "../file";
import {getMaybeResolvedFile, getResolvedFile} from "../file/resolve-file";

export interface ListProductFilesOptions {
    accept?: string
}

export async function listProductFiles(productId: string, { accept }: ListProductFilesOptions = {}) {
    let files = await listNamedFiles("product", productId);
    files = files.filter(file => file.synced);
    if (accept) {
        // "image" will match "image/jpeg"
        files = files.filter(file => file.contentType?.startsWith(accept))
    }
    return files;
}

export interface GetProductFileOptions extends ListProductFilesOptions {
    fileId?: string;
    accept?: string;
}

export async function getProductFile(productId: string, { fileId, accept }: GetProductFileOptions = {}) {
    if (fileId) {
        const file = await getNamedFile("product", productId, fileId);
        // Must be synced already to be able to get it
        return getMaybeResolvedFile(file);
    }
    const files = await listProductFiles(productId, { accept });
    if (!files.length) return undefined;
    const pinned = files.filter(file => file.pinned);
    if (pinned.length === 1) return getResolvedFile(pinned[0]);
    if (pinned.length) return getResolvedFile(pinned[pickIndex(pinned.length)])
    return getResolvedFile(files[pickIndex(files.length)]);

    function pickIndex(length: number) {
        const max = length - 1;
        return Math.max(
            0,
            Math.min(
                max,
                Math.round(Math.random() * max)
            )
        );
    }
}