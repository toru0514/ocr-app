import { Document, ExportIssue } from '../domain/types';

type ValidationOptions = {
  from: Date;
  to: Date;
};

type ValidationResult = {
  rows: string[][];
  issues: ExportIssue[];
};

const TAX_CATEGORIES = new Set(['standard_10', 'reduced_8', 'exempt']);
const MAX_VENDOR_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 100;
const MAX_AMOUNT = 1_000_000_000;
const MAX_AMOUNT_LABEL = MAX_AMOUNT.toLocaleString('ja-JP');

function isWithinRange(date: Date, { from, to }: ValidationOptions) {
  return date >= from && date <= to;
}

function createIssue(params: {
  code: ExportIssue['code'];
  severity?: ExportIssue['severity'];
  message: string;
  document: Document;
  entryId?: string;
  field?: string;
}): ExportIssue {
  return {
    code: params.code,
    severity: params.severity ?? 'error',
    message: params.message,
    documentId: params.document.id,
    documentName: params.document.originalName,
    entryId: params.entryId,
    field: params.field,
  };
}

export function validateDocumentsForExport(documents: Document[], options: ValidationOptions): ValidationResult {
  const issues: ExportIssue[] = [];
  const rows: string[][] = [];
  const invalidStatusDocuments = new Set<string>();

  for (const document of documents) {
    const entries = document.entries ?? [];

    for (const entry of entries) {
      const entryId = entry.id;

      if (!entry.date) {
        issues.push(
          createIssue({
            document,
            entryId,
            code: 'missing_field',
            message: '取引日が入力されていません',
            field: 'date',
          })
        );
        continue;
      }

      const entryDate = new Date(entry.date);
      if (Number.isNaN(entryDate.getTime())) {
        issues.push(
          createIssue({
            document,
            entryId,
            code: 'invalid_date',
            message: `取引日「${entry.date}」の形式が不正です`,
            field: 'date',
          })
        );
        continue;
      }

      if (!isWithinRange(entryDate, options)) {
        issues.push(
          createIssue({
            document,
            entryId,
            code: 'date_out_of_range',
            severity: 'warning',
            message: `取引日 ${entry.date} は指定期間外のため CSV に含めません`,
            field: 'date',
          })
        );
        continue;
      }

      if (document.status !== 'confirmed') {
        if (!invalidStatusDocuments.has(document.id)) {
          issues.push(
            createIssue({
              document,
              code: 'document_status',
              message: `ドキュメント「${document.originalName}」が確定済みではないためエクスポートできません`,
              field: 'status',
            })
          );
          invalidStatusDocuments.add(document.id);
        }
        continue;
      }

      const vendor = (entry.vendor ?? '').trim();
      const accountTitle = (entry.accountTitle ?? '').trim();
      const description = (entry.description ?? '').trim();
      const taxCategory = entry.taxCategory;
      const amountIn = Number.isFinite(entry.amountIn) ? entry.amountIn : 0;
      const amountOut = Number.isFinite(entry.amountOut) ? entry.amountOut : 0;
      const entryErrors: ExportIssue[] = [];

      if (!vendor) {
        entryErrors.push(
          createIssue({
            document,
            entryId,
            code: 'missing_field',
            message: '相手先が入力されていません',
            field: 'vendor',
          })
        );
      }

      if (vendor && vendor.length > MAX_VENDOR_LENGTH) {
        entryErrors.push(
          createIssue({
            document,
            entryId,
            code: 'length_over',
            message: `相手先は ${MAX_VENDOR_LENGTH} 文字以内で入力してください`,
            field: 'vendor',
          })
        );
      }

      if (!accountTitle) {
        entryErrors.push(
          createIssue({
            document,
            entryId,
            code: 'missing_field',
            message: '勘定科目が選択されていません',
            field: 'account_title',
          })
        );
      }

        if (!taxCategory || !TAX_CATEGORIES.has(taxCategory)) {
          entryErrors.push(
            createIssue({
              document,
              entryId,
              code: 'invalid_tax_category',
              message: '税区分が不正です',
              field: 'tax_category',
            })
          );
        }

        if (amountIn === 0 && amountOut === 0) {
          entryErrors.push(
            createIssue({
              document,
              entryId,
              code: 'amount_zero',
              message: '入金または出金のどちらかに金額を入力してください',
              field: 'amount_out',
            })
          );
        }

        if (amountIn < 0) {
          entryErrors.push(
            createIssue({
              document,
              entryId,
              code: 'amount_zero',
              message: '入金金額は 0 以上の整数で入力してください',
              field: 'amount_in',
            })
          );
        }

        if (amountOut < 0) {
          entryErrors.push(
            createIssue({
              document,
              entryId,
              code: 'amount_zero',
              message: '出金金額は 0 以上の整数で入力してください',
              field: 'amount_out',
            })
          );
        }

        if (amountIn > MAX_AMOUNT) {
          entryErrors.push(
            createIssue({
              document,
              entryId,
              code: 'amount_zero',
              message: `入金金額は ${MAX_AMOUNT_LABEL} 円以内で入力してください`,
              field: 'amount_in',
            })
          );
        }

        if (amountOut > MAX_AMOUNT) {
          entryErrors.push(
            createIssue({
              document,
              entryId,
              code: 'amount_zero',
              message: `出金金額は ${MAX_AMOUNT_LABEL} 円以内で入力してください`,
              field: 'amount_out',
            })
          );
        }

        if (description.length > MAX_DESCRIPTION_LENGTH) {
          entryErrors.push(
            createIssue({
              document,
              entryId,
              code: 'length_over',
              message: `摘要は ${MAX_DESCRIPTION_LENGTH} 文字以内で入力してください`,
              field: 'description',
            })
          );
        }

      if (entryErrors.length > 0) {
        issues.push(...entryErrors);
        continue;
      }

      rows.push([
        entry.date,
        amountIn > 0 ? String(amountIn) : '',
        amountOut > 0 ? String(amountOut) : '',
        vendor,
        accountTitle,
        taxCategory,
        description,
        document.id,
      ]);
    }
  }

  return { rows, issues };
}
