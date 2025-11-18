import { NextRequest, NextResponse } from 'next/server';
import { documentService } from '@/modules/bookkeeping/infra';
import { DocumentStatus } from '@/modules/bookkeeping/domain/types';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { note, status }: { note?: string; status?: DocumentStatus } = await request.json();

  if (status && !['draft', 'in_review', 'confirmed'].includes(status)) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 });
  }

  const document = await documentService.getDocument(id);
  if (!document) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  document.note = note ?? document.note;
  document.status = status ?? document.status;

  await documentService.saveDocument(document);

  return NextResponse.json({ success: true });
}
