import { ChatGroq } from '@langchain/groq';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

let globalLLM: ChatGroq | null = null;

// Initialize Groq LLM
export const initializeGroqLLM = () => {
  if (globalLLM) return globalLLM;

  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }

  globalLLM = new ChatGroq({
    apiKey: apiKey,
    model: 'openai/gpt-oss-120b',
    temperature: 0.7,
  });

  return globalLLM;
};

// Split text into chunks using RecursiveCharacterTextSplitter
export const splitTextIntoChunks = async (text: string, chunkSize: number = 1000, overlap: number = 200): Promise<string[]> => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap: overlap,
  });

  const chunks = await splitter.splitText(text);
  return chunks;
};