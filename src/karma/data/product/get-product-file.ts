import {File} from "../file";
import {listProducts, ListProductsInput} from "./list-products";
import {getResolvedNamedFile, listResolvedNamedFiles} from "../file";
import {
    GetResolvedNamedFileOptions,
    ListResolvedNamedFileOptions
} from "@opennetwork/logistics/src/data/file/resolve-files";

export interface GetProductFileListOptions {
    accept?: string;
    public?: boolean;
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

export async function getProductFiles(productId: string, options: ListResolvedNamedFileOptions = {}): Promise<File[]> {
    return listResolvedNamedFiles("product", productId, options);
}

export async function getProductFile(productId: string, options: GetResolvedNamedFileOptions = {}): Promise<File | undefined> {
    return getResolvedNamedFile("product", productId, options)
}