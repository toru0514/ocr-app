import { DocumentService } from '../application/documents';
import { ExportService } from '../application/export';
import { MockDocumentRepository, MockExportRepository } from './mock-document-repository';

const documentRepository = new MockDocumentRepository();
const exportRepository = new MockExportRepository();

export const documentService = new DocumentService(documentRepository);
export const exportService = new ExportService(exportRepository);
