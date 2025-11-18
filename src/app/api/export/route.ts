import { NextRequest, NextResponse } from 'next/server';
import { documentService } from '@/modules/bookkeeping/infra';

const CSV_HEADERS = ['date', 'amount', 'vendor', 'account_title', 'tax_category', 'description', 'document_id'];

type DraftResult = {
  csv: string;
  issues: string[];
};

function toCsv(rows: string[][]) {
  return rows
    .map((row) =>
      row
        .map((value) => {
          if (value === undefined || value === null) return '';
          const needsQuote = /[",\n]/.test(value);
          const escaped = value.replace(/"/g, '""');
          return needsQuote ? `"${escaped}"` : escaped;
        })
        .join(',')
    )
    .join('\n');
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { from, to } = body as { from?: string; to?: string };

  if (!from || !to) {
    return NextResponse.json({ error: '期間（from/to）を指定してください' }, { status: 400 });
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  const documents = await documentService.listDocuments();
  const issues: DraftResult['issues'] = [];
  const rows: string[][] = [CSV_HEADERS];

  documents.forEach((document) => {
    if (document.status !== 'confirmed') {
      if (document.entries.length > 0) {
        issues.push(`ドキュメント ${document.originalName} は confirmed ではありません`);
      }
      return;
    }

    document.entries.forEach((entry) => {
      const entryDate = new Date(entry.date);
      if (Number.isNaN(entryDate.getTime())) {
        issues.push(`エントリ ${entry.id} の日付フォーマットが不正です`);
        return;
      }

      if (entryDate < fromDate || entryDate > toDate) {
        return;
      }

      const missing: string[] = [];
      if (!entry.vendor) missing.push('vendor');
      if (!entry.accountTitle) missing.push('account_title');
      if (!entry.amount) missing.push('amount');
      if (!entry.taxCategory) missing.push('tax_category');

      if (missing.length > 0) {
        issues.push(`エントリ ${entry.id} に未入力の項目: ${missing.join(', ')}`);
        return;
      }

      rows.push([
        entry.date,
        String(entry.amount),
        entry.vendor,
        entry.accountTitle,
        entry.taxCategory,
        entry.description ?? '',
        document.id,
      ]);
    });
  });

  const csv = toCsv(rows);
  return NextResponse.json({ csv, issues });
}
