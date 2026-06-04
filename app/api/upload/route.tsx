import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
    }

    const mobsfForm = new FormData();
    mobsfForm.append('file', file);

    const response = await fetch(`${process.env.MOBSF_URL}/api/v1/upload`, {
      method: 'POST',
      headers: {
        Authorization: process.env.MOBSF_API_KEY!,
      },
      body: mobsfForm,
    });

    const result = await response.json();
    console.log('MobSF upload result:', result);

    return NextResponse.json({
      hash: result.hash,
      fileName: result.file_name,
      analyzer: result.analyzer,
    });
  } catch (error) {
    console.error('HATA:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
