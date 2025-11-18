import { Document } from '../domain/types';
import { DocumentRepository } from './repositories';

export class DocumentService {
  constructor(private readonly repository: DocumentRepository) {}

  listDocuments() {
    return this.repository.listDocuments();
  }

  getDocument(id: string) {
    return this.repository.getDocument(id);
  }

  async saveDocument(document: Document) {
    await this.repository.saveDocument(document);
    return document;
  }
}
