import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save file to public/uploads directory
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    // Return public URL
    const publicUrl = `/uploads/${fileName}`;
    console.log('[v0] Upload successful:', publicUrl);
    
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('[v0] Upload error details:', error);
    return NextResponse.json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
