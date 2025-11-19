export type DocumentStatus = 'draft' | 'in_review' | 'confirmed';
export type DocumentSource = 'amazon' | 'rakuten' | 'manual' | 'other';

export interface Entry {
  id: string;
  documentId: string;
  date: string; // ISO date string
  vendor: string;
  accountTitle: string;
  amountIn: number;
  amountOut: number;
  taxCategory: 'standard_10' | 'reduced_8' | 'exempt';
  description?: string;
  status: DocumentStatus;
}

export interface Document {
  id: string;
  originalName: string;
  storagePath: string;
  status: DocumentStatus;
  source: DocumentSource;
  createdAt: string;
  updatedAt: string;
  note?: string;
  entries: Entry[];
}
