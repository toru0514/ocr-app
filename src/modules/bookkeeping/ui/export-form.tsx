'use client';

import { useState } from 'react';

interface Props {
  onExport: (range: { from: string; to: string }) => Promise<void> | void;
}

export function ExportForm({ onExport }: Props) {
  const [range, setRange] = useState({ from: '', to: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    await onExport(range);
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
        {status === 'loading' ? 'CSV生成中…' : 'CSVエクスポート'}
      </button>
      {status === 'success' ? <p className="text-sm text-green-600">エクスポートが完了しました。</p> : null}
    </form>
  );
}
