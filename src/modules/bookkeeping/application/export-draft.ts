import { documentService } from '../infra';
import { validateDocumentsForExport } from './export-validators';
import type { ExportIssue } from '../domain/types';

const CSV_COLUMNS = ['date', 'amount_in', 'amount_out', 'vendor', 'account_title', 'tax_category', 'description', 'document_id'];

type DraftResult = {
  csv: string;
  issues: ExportIssue[];
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

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    throw new Error('期間の指定が正しくありません');
  }

  if (fromDate > toDate) {
    throw new Error('開始日は終了日以前に設定してください');
  }

  const documents = await documentService.listDocuments();
  const { rows: validatedRows, issues } = validateDocumentsForExport(documents, { from: fromDate, to: toDate });
  const rows: string[][] = options?.includeHeader === false ? [] : [CSV_COLUMNS];
  rows.push(...validatedRows);

  return {
    csv: toCsv(rows),
    issues,
  };
}
