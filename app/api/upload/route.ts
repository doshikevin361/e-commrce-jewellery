import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { put } from '@vercel/blob';

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

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;

    // Prefer Vercel Blob in read-only serverless environments (e.g. production)
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (blobToken) {
      console.log('[v1] Uploading to Vercel Blob');
      const { url } = await put(fileName, buffer, {
        access: 'public',
        token: blobToken,
        contentType: file.type || 'application/octet-stream',
      });
      console.log('[v1] Blob upload successful:', url);
      return NextResponse.json({ url });
    }

    // Fallback to local filesystem (useful for local dev)
    console.log('[v1] Uploading to local filesystem');
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;
    console.log('[v1] Local upload successful:', publicUrl);
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('[v1] Upload error details:', error);

    if (error instanceof Error && 'code' in (error as any) && (error as any).code === 'EROFS') {
      return NextResponse.json(
        {
          error: 'Upload failed: read-only filesystem',
          details: 'Configure BLOB_READ_WRITE_TOKEN to store files in Vercel Blob when running in a serverless environment.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
