export interface FileData extends Record<string, unknown> {
  fileName: string;
  contentType: string;
  size?: number;
  path?: string;
  url?: string;
}

export interface File extends FileData {
  fileId: string;
  createdAt: string;
  updatedAt: string;
}
