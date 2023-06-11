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
        let pinned = files.filter(file => file.pinned);
        if (isPublic) {
            const synced = pinned.find(file => file.synced);
            if (pinned.length && synced.synced !== "disk") {
                // If is public, only allow pre watermarked files
                pinned = pinned.filter(file => !!file.sizes?.find(size => size.watermark))
            }
        }
        if (pinned.length === 1) return pinned[0];
        if (pinned.length) {
            if (typeof index === "number") {
                return pinned[index];
            }
            return pickWeightedFiles(pinned);
        }
        // Only allow viewing the pinned images if public
        if (isPublic) return undefined;
        return files[index ?? pickIndex(files.length)];
    }

    function pickWeightedFiles(files: File[]) {
        const weighted = files.flatMap(file => {
            const totalReactions = Object.values(file.reactionCounts || {})
                .reduce((sum, value) => sum + value, 0);
            if (!totalReactions) return [file];
            return Array.from({ length: totalReactions }, () => file);
        });
        // if (weighted.length !== files.length) {
        //     console.log("Weighted files", files);
        // }
        // Mix them up
        const randomOrder = weighted.map(() => Math.random());
        // Order based on random index given above
        const randomlyOrdered = weighted.sort(
            (a, b) => randomOrder[weighted.indexOf(a)] < randomOrder[weighted.indexOf(b)] ? -1 : 1
        )
        // Pick from the randomly ordered files
        return randomlyOrdered[pickIndex(randomlyOrdered.length)];
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