import { notFound } from 'next/navigation';
import { documentService } from '@/modules/bookkeeping/infra';
import { DocumentEditor } from '@/modules/bookkeeping/ui/document-editor';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DocumentDetailPage({ params }: Props) {
  const { id } = await params;
  const document = await documentService.getDocument(id);

  if (!document) {
    notFound();
  }

  return (
    <main className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{document.originalName}</h1>
        <p className="text-sm text-muted-foreground">ステータス: {document.status}</p>
      </div>
      <DocumentEditor document={document} />
    </main>
  );
}
