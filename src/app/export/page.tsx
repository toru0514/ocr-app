'use client';

import { exportService } from '@/modules/bookkeeping/infra';
import { ExportForm } from '@/modules/bookkeeping/ui/export-form';

export default function ExportPage() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">CSVエクスポート（MVP）</h1>
        <p className="text-sm text-muted-foreground">Phase A ではモックのエクスポート処理を提供しています。</p>
      </div>
      <ExportForm
        onExport={async () => {
          await exportService.exportByDocumentIds(['doc_1']);
          alert('モックのCSVエクスポートを実行しました。');
        }}
      />
    </main>
  );
}
