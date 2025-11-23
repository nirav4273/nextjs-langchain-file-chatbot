# Simplified RAG Chat Flow (No Storage/Search)

## Overview
The system now uses a simple on-the-fly processing approach:
- PDF chunks are read from file and passed directly to LLM with user questions
- No document storage in memory
- No search/retrieval logic
- Minimal dependencies and maximum simplicity

## Flow

### 1. User Uploads PDF
```
FileUploadComponent
  → /api/upload
    → Saves file to /uploads/
    → Returns filename
  → /api/process-document
    → Just validates filename
    → Returns ready status
  → ChatInterface receives filename
```

### 2. User Asks Question
```
ChatInterface
  → /api/chat (with message + filename)
    → Loads PDF file from /uploads/{filename}
    → Extracts text from all pages
    → Splits text into chunks (1000 chars, 200 char overlap)
    → Combines ALL chunks as context
    → Sends to Groq LLM with question
    → Returns LLM response
  → Displays response to user
```

## Key Changes

### langchainSetup.ts
- **Removed**: All document storage (`globalDocuments` array)
- **Removed**: `storeDocuments()`, `getGlobalDocuments()`, `resetDocuments()`
- **Removed**: `simpleSearch()` (no search logic needed)
- **Removed**: `createRAGChain()` (no RAG chain needed)
- **Kept**: `initializeGroqLLM()` - LLM initialization only
- **Added**: `splitTextIntoChunks()` - Simple text chunking utility

### process-document/route.ts
- **Before**: Loaded PDF, processed chunks, stored in memory
- **After**: Just validates filename and returns ready status
- **File processing**: Happens on-the-fly during chat requests

### chat/route.ts
- **Before**: Retrieved from stored documents using search logic
- **After**: Loads PDF file on every request, chunks it, sends all chunks to LLM
- **Flow**:
  1. Receive message + filename
  2. Load PDF from `/uploads/{filename}`
  3. Extract text from all pages
  4. Split text into chunks
  5. Combine all chunks as context
  6. Send to Groq LLM with system prompt
  7. Return response

### ChatInterface.tsx
- **Added**: `filename` prop (passed from page.tsx)
- **Updated**: `handleSendMessage()` to send filename with chat request
- **Updated**: Disabled input until filename is set

### FileUploadComponent.tsx
- **Added**: `onFileProcessed` callback prop
- **Updated**: Calls callback with filename after processing

### page.tsx
- **Added**: State to track uploaded filename
- **Updated**: Passes filename between FileUploadComponent and ChatInterface

## API Endpoints

### POST /api/upload
Input: FormData with file
Output: `{ filename: string }`

### POST /api/process-document
Input: `{ filename: string }`
Output: `{ success: true, document: { filename: string, status: 'ready' } }`

### POST /api/chat
Input: `{ message: string, filename: string }`
Output: `{ success: true, message: string, document: string, chunksUsed: number }`

## Text Chunking
- **Chunk Size**: 1000 characters
- **Overlap**: 200 characters
- **Strategy**: Breaks at sentence boundaries (periods) when possible
- **Applied**: On-the-fly in chat endpoint, not pre-computed

## Environment Variables Required
- `GROQ_API_KEY`: Your Groq API key

## Dependencies
- `@langchain/groq`: Groq LLM
- `@langchain/core`: Core types and message classes
- `@langchain/community`: PDFLoader for PDF extraction

## No Vector Database
- Documents are NOT stored persistently
- Each chat request loads and processes the PDF fresh
- Perfect for single-document per session use case
- Simple and lightweight

## Benefits
✅ No external vector database needed
✅ No embedding generation required
✅ Simple, straightforward code
✅ Minimal dependencies
✅ Fast iteration
✅ Lower cost (no vector store)
✅ Easy to understand and debug

## Trade-offs
⚠️ PDF loaded fresh for every question (slower for large PDFs)
⚠️ All chunks sent to LLM (no intelligent retrieval/filtering)
⚠️ May hit LLM context limits for very large documents
⚠️ No multi-document support in current session
