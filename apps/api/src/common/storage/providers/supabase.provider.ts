import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageProvider, StorageUploadResponse } from '../interfaces/storage-provider.interface';

export class SupabaseStorageProvider implements StorageProvider {
  private supabase: SupabaseClient;

  constructor(url: string, key: string) {
    this.supabase = createClient(url, key);
  }

  async generateUploadUrl(bucket: string, path: string): Promise<StorageUploadResponse> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error) throw error;

    const { data: publicData } = this.supabase.storage.from(bucket).getPublicUrl(path);

    return {
      uploadUrl: data.signedUrl,
      publicUrl: publicData.publicUrl,
      token: data.token,
      path: data.path,
    };
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    await this.supabase.storage.from(bucket).remove([path]);
  }
}
