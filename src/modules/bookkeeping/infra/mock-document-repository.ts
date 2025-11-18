import { Document } from '../domain/types';
import { DocumentRepository, ExportRepository } from '../application/repositories';

const demoDocuments: Document[] = [
  {
    id: 'doc_1',
    originalName: 'amazon_receipt.pdf',
    storagePath: 'receipts/2024/doc_1.pdf',
    status: 'in_review',
    source: 'amazon',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    note: 'サンプルデータ',
    entries: [
      {
        id: 'entry_1',
        documentId: 'doc_1',
        date: new Date().toISOString().split('T')[0],
        vendor: 'Amazon.co.jp',
        accountTitle: '消耗品費',
        amount: 9800,
        taxCategory: 'standard_10',
        description: 'モニターライト',
        status: 'in_review',
      },
    ],
  },
  {
    id: 'doc_2',
    originalName: 'rakuten.pdf',
    storagePath: 'receipts/2024/doc_2.pdf',
    status: 'draft',
    source: 'rakuten',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    entries: [],
  },
];

export class MockDocumentRepository implements DocumentRepository {
  private documents = demoDocuments;

  async listDocuments() {
    return this.documents;
  }

  async getDocument(id: string) {
    return this.documents.find((doc) => doc.id === id) ?? null;
  }

  async saveDocument(document: Document) {
    const idx = this.documents.findIndex((doc) => doc.id === document.id);
    if (idx === -1) {
      this.documents.push(document);
    } else {
      this.documents[idx] = document;
    }
  }
}

export class MockExportRepository implements ExportRepository {
  exportDocuments(documentIds: string[]) {
    return Promise.resolve({ url: `/api/export?ids=${documentIds.join(',')}` });
  }
}
