import { documentService } from '@/modules/bookkeeping/infra';
import { DocumentTable } from '@/modules/bookkeeping/ui/document-table';

export const metadata = {
  title: 'ドキュメント一覧',
};

export default async function DocumentsPage() {
  const documents = await documentService.listDocuments();

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">アップロード済みドキュメント</h1>
        <p className="text-sm text-muted-foreground">Phase A の要件を満たすためのプレースホルダー実装です。</p>
      </div>
      <DocumentTable documents={documents} />
    </main>
  );
}
