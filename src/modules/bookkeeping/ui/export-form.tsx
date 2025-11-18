'use client';

import { useState } from 'react';

type ExportResult = {
  csv: string;
  issues: string[];
};

export function ExportForm() {
  const [range, setRange] = useState({ from: '', to: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<ExportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setStatus('error');
      return;
    }

    const json = (await response.json()) as ExportResult;
    setResult(json);
    setStatus('success');
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
      <button
        type="submit"
        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'CSV生成中…' : 'CSV下書きを作成'}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {result ? (
        <div className="space-y-3 rounded-lg border p-4">
          <div>
            <h2 className="text-base font-semibold">整合性チェック</h2>
            {result.issues.length === 0 ? (
              <p className="text-sm text-green-600">問題は見つかりませんでした。</p>
            ) : (
              <ul className="list-disc pl-5 text-sm text-red-600">
                {result.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
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
