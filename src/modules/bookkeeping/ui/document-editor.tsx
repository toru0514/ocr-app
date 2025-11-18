'use client';

import { useState } from 'react';
import { Document } from '../domain/types';

interface Props {
  document: Document;
  onSave?: (document: Document) => Promise<void> | void;
}

export function DocumentEditor({ document, onSave }: Props) {
  const [note, setNote] = useState(document.note ?? '');
  const [status, setStatus] = useState(document.status);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (onSave) {
      await onSave({ ...document, note, status });
    } else {
      console.info('onSave handler is not provided. Mock保存: ', { note, status });
    }
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
      <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
        保存
      </button>
    </form>
  );
}
