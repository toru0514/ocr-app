import { Document, DocumentStatus } from '../domain/types';

export interface DocumentRepository {
  listDocuments(): Promise<Document[]>;
  getDocument(id: string): Promise<Document | null>;
  saveDocument(document: Document): Promise<void>;
  createDocument(input: {
    originalName: string;
    storagePath: string;
    source: Document['source'];
    note?: string;
    createdBy: string;
    status?: DocumentStatus;
  }): Promise<Document>;
}

export interface ExportRepository {
  exportDocuments(documentIds: string[]): Promise<{ url: string } | null>;
}
