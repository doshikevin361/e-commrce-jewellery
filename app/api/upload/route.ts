import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('[v0] Upload request received');
    
    const formData = await request.formData();
    console.log('[v0] FormData parsed');
    
    const file = formData.get('file') as File;
    console.log('[v0] File from formData:', file?.name, file?.size, file?.type);

    if (!file) {
      console.error('[v0] No file in request');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size === 0) {
      console.error('[v0] File is empty');
      return NextResponse.json({ error: 'File is empty' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      console.error('[v0] File is not an image:', file.type);
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    console.log('[v0] Uploading to Vercel Blob...');
    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    console.log('[v0] Upload successful:', blob.url);
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('[v0] Upload error details:', error);
    return NextResponse.json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
