import { Document } from '../domain/types';

export interface DocumentRepository {
  listDocuments(): Promise<Document[]>;
  getDocument(id: string): Promise<Document | null>;
  saveDocument(document: Document): Promise<void>;
}

export interface ExportRepository {
  exportDocuments(documentIds: string[]): Promise<{ url: string } | null>;
}
