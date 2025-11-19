import { NextRequest, NextResponse } from 'next/server';
import { generateCsvDraft } from '@/modules/bookkeeping/application/export-draft';
import { encodeShiftJIS } from '@/modules/shared/encoding';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { from, to } = body as { from?: string; to?: string };

  if (!from || !to) {
    return NextResponse.json({ error: '期間（from/to）を指定してください' }, { status: 400 });
  }

  try {
    const { csv, issues } = await generateCsvDraft({ from, to }, { includeHeader: false });

    if (issues.length > 0) {
      return NextResponse.json({ error: '整合性チェックに失敗しました', issues }, { status: 400 });
    }

    const buffer = encodeShiftJIS(csv);
    const uint8array = Uint8Array.from(buffer);
    return new NextResponse(uint8array.buffer, {
      headers: {
        'Content-Type': 'text/csv; charset=Shift_JIS',
        'Content-Disposition': `attachment; filename="entries_${from}_${to}.csv"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CSV ダウンロードに失敗しました';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
