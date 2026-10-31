export interface DocumentChunk {
  id: string;
  documentId: string;
  source: string;
  page: number;
  text: string;
  startWord: number;
  endWord: number;
  vector?: number[];
  score?: number;
  topics?: string[];
  x?: number;
  y?: number;
}

export interface DocumentPage {
  pageNumber: number;
  text: string;
  wordCount: number;
}

export interface AcademicDocument {
  id: string;
  title: string;
  code: string;
  description: string;
  filename: string;
  uploadDate: string;
  pageCount: number;
  chunkCount: number;
  topics: string[];
  pages: DocumentPage[];
  chunks: DocumentChunk[];
}

export interface Citation {
  source: string;
  page: number;
  chunkId?: string;
  textSnippet: string;
  similarity: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  retrievedChunks?: DocumentChunk[];
  citations?: Citation[];
  latencyMs?: number;
  modelUsed?: string;
  isGrounded?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  courseFilter: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  source: string;
  page: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  source: string;
  page: number;
}

export interface SystemStats {
  totalDocuments: number;
  totalPages: number;
  totalChunks: number;
  totalQueriesProcessed: number;
  avgLatencyMs: number;
  embeddingDimensions: number;
  geminiModel: string;
  retrievalEngine: string;
}
