import { NextRequest, NextResponse } from 'next/server';
import { documentService } from '@/modules/bookkeeping/infra';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'receipt-documents';
const defaultUserId = process.env.SUPABASE_DEFAULT_USER_ID;

export async function POST(request: NextRequest) {
  if (!defaultUserId) {
    return NextResponse.json({ error: 'SUPABASE_DEFAULT_USER_ID is not configured' }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'ファイルが選択されていません' }, { status: 400 });
  }

  if (!file.type.includes('pdf')) {
    return NextResponse.json({ error: 'PDF ファイルのみアップロード可能です' }, { status: 400 });
  }

  const client = createSupabaseServerClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}-${file.name}`;
  const storagePath = `receipts/${new Date().getFullYear()}/${filename}`;

  const { error: storageError } = await client.storage
    .from(bucket)
    .upload(storagePath, buffer, {
      contentType: file.type || 'application/pdf',
      upsert: false,
    });

  if (storageError) {
    console.error('supabase storage upload error', storageError.message);
    return NextResponse.json({ error: 'アップロードに失敗しました' }, { status: 500 });
  }

  await documentService.createDocument({
    originalName: file.name,
    storagePath,
    source: 'manual',
    createdBy: defaultUserId,
  });

  return NextResponse.json({ success: true });
}
