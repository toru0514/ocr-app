import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Document } from '../domain/types';
import { DocumentRepository } from '../application/repositories';

export class SupabaseDocumentRepository implements DocumentRepository {
  private client = createSupabaseBrowserClient();

  async listDocuments() {
    // TODO: Supabase RPC へ差し替え予定。現状は空配列を返す。
    const { data, error } = await this.client.from('documents').select('*').limit(0);
    if (error) {
      console.warn('listDocuments not implemented', error.message);
    }
    return (data as Document[]) ?? [];
  }

  async getDocument() {
    console.warn('getDocument is not implemented yet. returning null');
    return null;
  }

  async saveDocument() {
    console.warn('saveDocument is not implemented yet');
  }
}
