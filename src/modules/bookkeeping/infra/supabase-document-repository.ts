import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Document, DocumentStatus, Entry } from '../domain/types';
import { DocumentRepository } from '../application/repositories';

type EntryRow = {
  id: string;
  document_id: string;
  date: string;
  vendor: string;
  account_title: string;
  amount: number;
  tax_category: Entry['taxCategory'];
  description: string | null;
  status?: Entry['status'];
};

type DocumentRow = {
  id: string;
  original_name: string;
  storage_path: string;
  status: Document['status'];
  source: Document['source'];
  created_at: string;
  updated_at: string;
  note: string | null;
  entries?: EntryRow[];
};

function mapEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    documentId: row.document_id,
    date: row.date,
    vendor: row.vendor,
    accountTitle: row.account_title,
    amount: row.amount,
    taxCategory: row.tax_category,
    description: row.description ?? undefined,
    status: row.status ?? 'draft',
  };
}

function mapDocument(row: DocumentRow): Document {
  return {
    id: row.id,
    originalName: row.original_name,
    storagePath: row.storage_path,
    status: row.status,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    note: row.note ?? undefined,
    entries: (row.entries ?? []).map(mapEntry),
  };
}

export class SupabaseDocumentRepository implements DocumentRepository {
  private readonly client = createSupabaseServerClient();

  async listDocuments(): Promise<Document[]> {
    const { data, error } = await this.client
      .from('documents')
      .select('*, entries(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('documents.listDocuments error', error.message);
      return [];
    }

    return (data ?? []).map(mapDocument);
  }

  async getDocument(id: string): Promise<Document | null> {
    const { data, error } = await this.client
      .from('documents')
      .select('*, entries(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('documents.getDocument error', error.message);
      return null;
    }

    return data ? mapDocument(data) : null;
  }

  async saveDocument(document: Document): Promise<void> {
    const payload = {
      note: document.note ?? null,
      status: document.status,
    };
    const { error } = await this.client.from('documents').update(payload).eq('id', document.id);

    if (error) {
      throw new Error(`documents.saveDocument error: ${error.message}`);
    }
  }

  async createDocument(input: {
    originalName: string;
    storagePath: string;
    source: Document['source'];
    note?: string;
    createdBy: string;
    status?: DocumentStatus;
  }): Promise<Document> {
    const payload = {
      original_name: input.originalName,
      storage_path: input.storagePath,
      source: input.source,
      note: input.note ?? null,
      status: input.status ?? 'draft',
      created_by: input.createdBy,
    };

    const { data, error } = await this.client
      .from('documents')
      .insert(payload)
      .select('*, entries(*)')
      .single();

    if (error) {
      throw new Error(`documents.createDocument error: ${error.message}`);
    }

    return mapDocument(data as DocumentRow);
  }
}
