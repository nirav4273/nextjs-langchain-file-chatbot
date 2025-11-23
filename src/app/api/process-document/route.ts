import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { filename } = await request.json();

    if (!filename) {
      return NextResponse.json(
        { error: 'No filename provided' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Document ready for questions',
      document: {
        filename: filename,
        status: 'ready',
      },
    });
  } catch (error) {
    console.error('Document processing error:', error);
    return NextResponse.json(
      {
        error: 'Error processing document',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}