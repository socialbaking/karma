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
            // Use the most recent first, updated images please :)
            return a.uploadedAt > b.uploadedAt ? -1 : 1
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
    public?: boolean;
}

export async function getProductFile(productId: string, { fileId, accept, index, public: isPublic }: GetProductFileOptions = {}): Promise<File | undefined> {
    if (fileId) {
        const file = await getNamedFile("product", productId, fileId);
        // Must be synced already to be able to get it
        return getMaybeResolvedFile(file, {
            public: isPublic
        });
    }
    const files = await getProductFiles(productId, { accept })
    const file = pick();
    if (!file) return undefined;
    return getResolvedFile(file, {
        public: isPublic
    });

    function pick() {
        if (!files.length) return undefined;
        // Allow picking directly from the sorted list if authenticated
        if (!isPublic && index) return files[index];
        const pinned = files.filter(file => file.pinned);
        if (pinned.length === 1) return pinned[0];
        if (pinned.length) return pinned[index ?? pickIndex(pinned.length)]
        // Only allow viewing the pinned images if public
        if (isPublic) return undefined;
        return files[index ?? pickIndex(files.length)];
    }

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