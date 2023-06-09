import {File, getNamedFile, listNamedFiles} from "../file";
import {getMaybeResolvedFile, getResolvedFile} from "../file/resolve-file";
import {listProducts, ListProductsInput} from "./list-products";

export interface GetProductFileListOptions {
    accept?: string
}

export interface ListProductFilesOptions extends GetProductFileListOptions, ListProductsInput {

}

export async function listProductFiles(options?: ListProductFilesOptions): Promise<File[]> {
    const products = await listProducts(options);
    const productFiles = await Promise.all(
        products.map(product => getProductFile(product.productId, options))
    );
    return productFiles.filter(Boolean);
}

export async function getProductFiles(productId: string, { accept }: GetProductFileListOptions = {}): Promise<File[]> {
    let files = await listNamedFiles("product", productId);
    files = files
        .filter(file => file.synced)
        .sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (b.pinned && !a.pinned) return 1;
            return a.uploadedAt < b.uploadedAt ? -1 : 1
        });
    if (accept) {
        // "image" will match "image/jpeg"
        files = files.filter(file => file.contentType?.startsWith(accept))
    }
    return files;
}

export interface GetProductFileOptions extends GetProductFileListOptions {
    fileId?: string;
    accept?: string;
    index?: number;
}

export async function getProductFile(productId: string, { fileId, accept, index }: GetProductFileOptions = {}): Promise<File | undefined> {
    if (fileId) {
        const file = await getNamedFile("product", productId, fileId);
        // Must be synced already to be able to get it
        return getMaybeResolvedFile(file);
    }
    const files = await getProductFiles(productId, { accept })
    if (!files.length) return undefined;
    const pinned = files.filter(file => file.pinned);
    if (pinned.length === 1) return getResolvedFile(pinned[0]);
    if (pinned.length) return getResolvedFile(pinned[index ?? pickIndex(pinned.length)])
    return getResolvedFile(files[index ?? pickIndex(files.length)]);

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