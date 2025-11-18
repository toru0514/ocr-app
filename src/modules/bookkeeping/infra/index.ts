import { DocumentService } from '../application/documents';
import { ExportService } from '../application/export';
import { SupabaseDocumentRepository } from './supabase-document-repository';
import { MockExportRepository } from './mock-document-repository';

const documentRepository = new SupabaseDocumentRepository();
const exportRepository = new MockExportRepository();

export const documentService = new DocumentService(documentRepository);
export const exportService = new ExportService(exportRepository);
