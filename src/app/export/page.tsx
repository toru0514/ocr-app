import { ExportForm } from '@/modules/bookkeeping/ui/export-form';

export default function ExportPage() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">CSVエクスポート（MVP）</h1>
        <p className="text-sm text-muted-foreground">Phase A では CSV 下書き作成と整合性チェックを提供しています。</p>
      </div>
      <ExportForm />
    </main>
  );
}
