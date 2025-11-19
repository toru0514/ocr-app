import { documentService } from '../infra';

const CSV_COLUMNS = ['date', 'amount_in', 'amount_out', 'vendor', 'account_title', 'tax_category', 'description', 'document_id'];

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

export async function generateCsvDraft(
  range: { from: string; to: string },
  options?: { includeHeader?: boolean }
): Promise<DraftResult> {
  const fromDate = new Date(range.from);
  const toDate = new Date(range.to);
  const documents = await documentService.listDocuments();
  const issues: DraftResult['issues'] = [];
  const rows: string[][] = options?.includeHeader === false ? [] : [CSV_COLUMNS];

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
      if (entry.amountIn === 0 && entry.amountOut === 0) missing.push('amount_in/out');
      if (!entry.taxCategory) missing.push('tax_category');

      if (missing.length > 0) {
        issues.push(`エントリ ${entry.id} に未入力の項目: ${missing.join(', ')}`);
        return;
      }

      const amountIn = entry.amountIn > 0 ? String(entry.amountIn) : '';
      const amountOut = entry.amountOut > 0 ? String(entry.amountOut) : '';

      rows.push([
        entry.date,
        amountIn,
        amountOut,
        entry.vendor,
        entry.accountTitle,
        entry.taxCategory,
        entry.description ?? '',
        document.id,
      ]);
    });
  });

  return {
    csv: toCsv(rows),
    issues,
  };
}
