import { NextResponse } from 'next/server';
import { initializeUploadDir, uploadDir } from '@/lib/multerConfig';
import path from 'path';
import { promises as fs } from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure upload directory exists
    await initializeUploadDir()

    // Create unique filename
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.name;
    const filepath = path.join(uploadDir, filename);

    // Write file to uploads directory
    await fs.writeFile(filepath, buffer);

    // Return success response
    return NextResponse.json({
      message: 'File uploaded successfully',
      filename: filename,
      path: filepath
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}