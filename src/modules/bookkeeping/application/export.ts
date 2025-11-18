import { ExportRepository } from './repositories';

export class ExportService {
  constructor(private readonly repository: ExportRepository) {}

  exportByDocumentIds(documentIds: string[]) {
    return this.repository.exportDocuments(documentIds);
  }
}
