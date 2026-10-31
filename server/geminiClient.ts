import { GoogleGenAI } from '@google/genai';

// Initialize the GoogleGenAI instance on the server-side as required by AI Studio guidelines
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export const GENERATION_MODEL = 'gemini-3.8-flash';
export const EMBEDDING_MODEL = 'gemini-embedding-2-preview';
