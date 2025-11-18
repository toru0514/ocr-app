'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DocumentUploader() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setMessage('PDF を選択してください');
      return;
    }

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      setMessage('アップロードしました');
      setFile(null);
      router.refresh();
    } else {
      const json = await response.json().catch(() => ({}));
      setMessage(json.error ?? 'アップロードに失敗しました');
    }

    setUploading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border p-4">
      <div>
        <label className="text-sm font-semibold">PDF アップロード</label>
        <input
          type="file"
          accept="application/pdf"
          className="mt-2 block w-full text-sm"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </div>
      <button
        type="submit"
        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        disabled={uploading}
      >
        {uploading ? 'アップロード中…' : 'アップロード'}
      </button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </form>
  );
}
