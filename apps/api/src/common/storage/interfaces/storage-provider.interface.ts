export interface StorageUploadResponse {
  uploadUrl: string;
  publicUrl: string;
  token?: string;
  path: string;
}

export interface StorageProvider {
  generateUploadUrl(bucket: string, path: string): Promise<StorageUploadResponse>;
  deleteFile(bucket: string, path: string): Promise<void>;
}
