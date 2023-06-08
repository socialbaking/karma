export type FileUploadedSource = "discord";
export type FileUploadedSynced = "r2" | "disk";

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
}

export interface File extends FileData {
  fileId: string;
  createdAt: string;
  updatedAt: string;
  uploadedAt: string;
}
