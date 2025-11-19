'use client';

import { useMemo, useState } from 'react';
import type { ExportIssue } from '@/modules/bookkeeping/domain/types';

type ExportResult = {
  csv: string;
  issues: ExportIssue[];
};

const FIELD_LABELS: Record<string, string> = {
  date: '取引日',
  vendor: '相手先',
  account_title: '勘定科目',
  tax_category: '税区分',
  amount_in: '金額（入金）',
  amount_out: '金額（出金）',
  description: '摘要',
  status: 'ステータス',
};

function getFieldLabel(field?: string) {
  if (!field) return '-';
  return FIELD_LABELS[field] ?? field;
}

export function ExportForm() {
  const [range, setRange] = useState({ from: '', to: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<ExportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const issueSummary = useMemo(() => {
    if (!result?.issues.length) return null;
    const errors = result.issues.filter((issue) => issue.severity === 'error').length;
    const warnings = result.issues.filter((issue) => issue.severity === 'warning').length;
    return { errors, warnings };
  }, [result]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    const response = await fetch('/api/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(range),
    });

    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      setError(json.error ?? 'CSV 生成に失敗しました');
      setResult(null);
      setStatus('error');
      return;
    }

    const json = (await response.json()) as ExportResult;
    setResult(json);
    setStatus('success');
  }

  async function handleDownload() {
    if (!result?.csv) return;
    const response = await fetch('/api/export/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(range),
    });

    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      setError(json.error ?? 'CSV ダウンロードに失敗しました');
      setStatus('error');
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `entries_${range.from}_${range.to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-sm font-medium">開始日</label>
          <input
            type="date"
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={range.from}
            onChange={(event) => setRange((prev) => ({ ...prev, from: event.target.value }))}
            required
          />
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium">終了日</label>
          <input
            type="date"
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={range.to}
            onChange={(event) => setRange((prev) => ({ ...prev, to: event.target.value }))}
            required
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'CSV生成中…' : 'CSV下書きを作成'}
        </button>
        {result?.csv ? (
          <button
            type="button"
            className="rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-60"
            onClick={handleDownload}
          >
            CSVファイルをダウンロード
          </button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {result ? (
        <div className="space-y-3 rounded-lg border p-4">
          <div>
            <h2 className="text-base font-semibold">整合性チェック</h2>
            {result.issues.length === 0 ? (
              <p className="text-sm text-green-600">問題は見つかりませんでした。</p>
            ) : (
              <div className="space-y-2">
                {issueSummary ? (
                  <p className="text-sm text-muted-foreground">
                    エラー {issueSummary.errors} 件 / 警告 {issueSummary.warnings} 件
                  </p>
                ) : null}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead>
                      <tr className="border-b text-xs uppercase text-muted-foreground">
                        <th className="py-2">対象</th>
                        <th className="py-2">項目</th>
                        <th className="py-2">区分</th>
                        <th className="py-2">内容</th>
                        <th className="py-2">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.issues.map((issue) => (
                        <tr key={`${issue.code}-${issue.documentId}-${issue.entryId ?? 'doc'}-${issue.field ?? 'none'}`} className="border-b last:border-0">
                          <td className="py-2 align-top">
                            <div className="font-medium">{issue.documentName}</div>
                            <div className="text-xs text-muted-foreground">
                              {issue.entryId ? `仕訳ID: ${issue.entryId}` : 'ドキュメント全体'}
                            </div>
                          </td>
                          <td className="py-2 align-top">{getFieldLabel(issue.field)}</td>
                          <td className="py-2 align-top">
                            <span
                              className={
                                issue.severity === 'error'
                                  ? 'rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700'
                                  : 'rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700'
                              }
                            >
                              {issue.severity === 'error' ? 'エラー' : '警告'}
                            </span>
                          </td>
                          <td className="py-2 align-top">{issue.message}</td>
                          <td className="py-2 align-top">
                            <a
                              className="text-xs font-semibold text-primary hover:underline"
                              href={`/documents/${issue.documentId}`}
                            >
                              編集する
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-base font-semibold">CSV（下書き）</h2>
            <textarea className="mt-2 w-full rounded border px-3 py-2 text-xs" rows={8} value={result.csv} readOnly />
          </div>
        </div>
      ) : null}
    </form>
  );
}
