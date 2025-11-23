import { NextResponse } from 'next/server';
import path from 'path';
import { initializeGroqLLM, splitTextIntoChunks } from '@/lib/langchainSetup';
import { loadPDFDocument } from '@/lib/pdfLoader';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

export async function POST(req: Request) {
  try {
    const { message, filename } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'No message provided' },
        { status: 400 }
      );
    }

    if (!filename) {
      return NextResponse.json(
        { error: 'No document loaded. Please upload a PDF first.' },
        { status: 400 }
      );
    }

    // Initialize LLM
    const llm = initializeGroqLLM();

    // Load PDF file on-the-fly
    const uploadDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadDir, filename);

    const loadedDocs = await loadPDFDocument(filePath);
    if (loadedDocs.length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF' },
        { status: 400 }
      );
    }

    // Extract and combine text from all pages
    const fullText = loadedDocs.map(doc => doc.pageContent).join('\n\n');

    // Split text into chunks
    const chunks = await splitTextIntoChunks(fullText, 1000, 200);

    // Combine all chunks as context
    const context = chunks.join('\n\n---\n\n');

    // Create system prompt with PDF context
    const systemPrompt = `You are a helpful AI assistant. Answer the user's question based on the provided context from the document.
If the answer is not in the context, say so clearly.

Context from document:
${context}`;

    // Create messages
    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(message),
    ];

    // Get response from LLM
    const response = await llm.invoke(messages);

    return NextResponse.json({
      success: true,
      message: response.content,
      document: filename,
      chunksUsed: chunks.length,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      {
        error: 'Error processing chat request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}