'use client';

import Link from 'next/link';
import { Document } from '../domain/types';

interface Props {
  documents: Document[];
}

export function DocumentTable({ documents }: Props) {
  if (documents.length === 0) {
    return <p className="text-sm text-muted-foreground">アップロードされたPDFはまだありません。</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y">
        <thead className="bg-muted/40 text-left text-sm font-semibold">
          <tr>
            <th className="px-4 py-2">ファイル名</th>
            <th className="px-4 py-2">ステータス</th>
            <th className="px-4 py-2">仕訳数</th>
            <th className="px-4 py-2">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y text-sm">
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td className="px-4 py-2 font-medium">{doc.originalName}</td>
              <td className="px-4 py-2">{doc.status}</td>
              <td className="px-4 py-2">{doc.entries.length}</td>
              <td className="px-4 py-2">
                <Link className="text-primary underline" href={`/documents/${doc.id}`}>
                  開く
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
