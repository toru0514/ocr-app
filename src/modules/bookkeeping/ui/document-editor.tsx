'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Document } from '../domain/types';

interface Props {
  document: Document;
}

export function DocumentEditor({ document }: Props) {
  const router = useRouter();
  const [note, setNote] = useState(document.note ?? '');
  const [status, setStatus] = useState(document.status);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const response = await fetch(`/api/documents/${document.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ note, status }),
    });

    if (response.ok) {
      setMessage('保存しました');
      router.refresh();
    } else {
      const json = await response.json().catch(() => ({}));
      setMessage(json.error ?? '保存に失敗しました');
    }

    setSaving(false);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="text-sm font-medium">メモ</label>
        <textarea
          className="mt-1 w-full rounded-md border px-3 py-2"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
        />
      </div>
      <div>
        <label className="text-sm font-medium">ステータス</label>
        <select
          className="mt-1 w-full rounded-md border px-3 py-2"
          value={status}
          onChange={(event) => setStatus(event.target.value as Document['status'])}
        >
          <option value="draft">draft</option>
          <option value="in_review">in_review</option>
          <option value="confirmed">confirmed</option>
        </select>
      </div>
      <button
        type="submit"
        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        disabled={saving}
      >
        {saving ? '保存中...' : '保存'}
      </button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </form>
  );
}
