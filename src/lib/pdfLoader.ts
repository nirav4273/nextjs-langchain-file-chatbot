import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

export interface LoadedDocument {
  pageContent: string;
  metadata: Record<string, any>;
}

export const loadPDFDocument = async (filePath: string): Promise<LoadedDocument[]> => {
  try {
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    
    return docs.map(doc => ({
      pageContent: doc.pageContent,
      metadata: doc.metadata
    }));
  } catch (error) {
    console.error('Error loading PDF:', error);
    throw new Error(`Failed to load PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const extractTextFromDocuments = (documents: LoadedDocument[]): string => {
  return documents.map(doc => doc.pageContent).join('\n\n');
};