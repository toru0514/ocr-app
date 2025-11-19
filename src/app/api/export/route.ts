import { NextRequest, NextResponse } from 'next/server';
import { generateCsvDraft } from '@/modules/bookkeeping/application/export-draft';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { from, to } = body as { from?: string; to?: string };

  if (!from || !to) {
    return NextResponse.json({ error: '期間（from/to）を指定してください' }, { status: 400 });
  }

  try {
    const result = await generateCsvDraft({ from, to });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CSV 生成に失敗しました';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
