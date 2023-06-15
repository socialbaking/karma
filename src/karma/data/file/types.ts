import {Expiring} from "../expiring";

export type BaseFileStoreType = "product" | "inventory" | "productFile" | "inventoryFile"
export type BaseFileRemoteSourceName = "discord" | BaseFileStoreType;
export type RemoteFileSourceName = BaseFileRemoteSourceName | `${BaseFileRemoteSourceName}_${number}`;

export type FileUploadedSynced = "r2" | "disk";
export type FileType = BaseFileStoreType | `${RemoteFileSourceName}_import`;

export interface ResolvedFilePart extends Record<string, unknown> {

}

export interface FileImageSize extends Expiring {
    width: number;
    height: number;
    signed?: boolean;
    fileName?: string;
    checksum?: Record<string, string>
}

export interface FileSize extends FileImageSize {
    url: string;
    synced: FileUploadedSynced;
    syncedAt: string;
    version: number;
    watermark?: boolean;
    copyright?: string;
    license?: string;
    fileName?: string;
    signed?: boolean;
}

export interface FileErrorDescription {
    stack?: string;
    message: string;
    createdAt: string;
    repeated?: number;
}

export interface FileData extends Record<string, unknown>, Partial<FileImageSize> {
    fileName: string;
    contentType: string;
    size?: number;
    path?: string;
    url?: string;
    pinned?: boolean;
    uploadedAt?: string;
    uploadedByUsername?: string;
    source?: RemoteFileSourceName;
    sourceId?: string;
    synced?: FileUploadedSynced;
    syncedAt?: string;
    version?: number;
    type?: FileType | string;
    sizes?: FileSize[];
    /** @deprecated use remoteUrl */
    externalUrl?: string;
    remoteUrl?: string;
    reactionCounts?: Record<string, number>;
    reactionCountsUpdatedAt?: string;
    resolved?: ResolvedFilePart[];
    resolvedAt?: string;
    errors?: FileErrorDescription[];
}

export interface File extends FileData {
    fileId: string;
    createdAt: string;
    updatedAt: string;
    uploadedAt: string;
}

export interface ResolvedFile extends File {
    url: string;
    synced: FileUploadedSynced;
}