export type FileUploadedSource = "discord";
export type FileUploadedSynced = "r2" | "disk";
export type FileType = "product";

export interface FileData extends Record<string, unknown> {
  fileName: string;
  contentType: string;
  size?: number;
  path?: string;
  url?: string;
  pinned?: boolean;
  uploadedAt?: string;
  uploadedByUsername?: string;
  source?: FileUploadedSource;
  synced?: FileUploadedSynced;
  syncedAt?: string;
  version?: number;
  type?: FileType | string;
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