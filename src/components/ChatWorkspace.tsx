import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  BookOpen,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Sliders,
  Sparkles,
  Info,
  ExternalLink,
  ShieldAlert,
  GraduationCap,
  Mic,
  MicOff,
  Globe,
  Bot
} from 'lucide-react';
import { ChatMessage, AcademicDocument } from '../types/rag.ts';

interface ChatWorkspaceProps {
  documents: AcademicDocument[];
  onOpenDocumentReader: (documentId: string, pageNumber: number, chunkId?: string) => void;
  initialQuery?: string;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  documents,
  onOpenDocumentReader,
  initialQuery,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Welcome to **CampusGPT**. I am your grounded academic learning assistant.\n\nAsk me any conceptual question, algorithm proof, or definition from your uploaded course texts. Every answer is strictly grounded with exact source and page citations. If a concept is not in your documents, I will refuse to hallucinate.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isGrounded: true,
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [topK, setTopK] = useState<number>(4);
  const [showConfig, setShowConfig] = useState(false);
  const [expandedChunksMessageId, setExpandedChunksMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const [chatMode, setChatMode] = useState<'rag' | 'search' | 'tutor'>('rag');
  const [tutorRole, setTutorRole] = useState<'general' | 'fast' | 'complex'>('general');
  const [isRecording, setIsRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasTriggeredInitialQuery = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Execute initial query from landing hero if provided
  useEffect(() => {
    if (initialQuery && !hasTriggeredInitialQuery.current) {
      hasTriggeredInitialQuery.current = true;
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  // Audio Recording with Microphone for gemini-3.5-transcribe
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());

        // Convert blob to base64
        setTranscribing(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            const res = await fetch('/api/gemini/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64Audio, mimeType: 'audio/webm' }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.transcription) {
                setInputQuery(data.transcription);
              }
            }
          } catch (err) {
            console.error('Transcription error:', err);
          } finally {
            setTranscribing(false);
          }
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access denied or unavailable: ' + (err as Error).message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || loading) return;

    setInputQuery('');

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      if (chatMode === 'search') {
        // Mode 2: Google Search Grounding with gemini-3.8-flash
        const res = await fetch('/api/gemini/search-grounding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: textToSend }),
        });

        if (!res.ok) throw new Error(`Search Grounding returned ${res.status}`);
        const data = await res.json();

        const assistantMessage: ChatMessage = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: `${data.answer}\n\n**Google Search Sources:**\n${(data.groundingSources || [])
            .map((s: any) => `• [${s.title}](${s.uri})`)
            .join('\n')}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'gemini-3.8-flash (Search Grounded)',
          isGrounded: true,
        };
        setMessages((prev) => [...prev, assistantMessage]);

      } else if (chatMode === 'tutor') {
        // Mode 3: Multi-turn Gemini Chatbot
        const res = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: textToSend,
            role: tutorRole,
            history: messages.slice(-6),
          }),
        });

        if (!res.ok) throw new Error(`Chat returned ${res.status}`);
        const data = await res.json();

        const assistantMessage: ChatMessage = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.modelUsed,
          isGrounded: true,
        };
        setMessages((prev) => [...prev, assistantMessage]);

      } else {
        // Mode 1: Course Grounded RAG Pipeline
        const historyPayload = messages
          .filter((m) => m.id !== 'welcome')
          .slice(-6)
          .map((m) => ({
            role: m.role,
            content: m.content,
          }));

        const res = await fetch('/api/rag/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: textToSend,
            courseFilter: selectedCourse,
            chatHistory: historyPayload,
            topK,
          }),
        });

        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }

        const data = await res.json();

        const assistantMessage: ChatMessage = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          retrievedChunks: data.retrievedChunks || [],
          citations: data.citations || [],
          latencyMs: data.latencyMs,
          modelUsed: data.model,
          isGrounded: (data.citations && data.citations.length > 0) && !data.answer.includes("I couldn't find that information"),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `Error processing query: ${(err as Error).message}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSpeech = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    } else {
      window.speechSynthesis.cancel();
      // Clean citation brackets for smoother TTS
      const cleanText = text.replace(/\(Source:.*?, Page: \d+\)/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingId(id);
    }
  };

  // Find document id matching filename
  const getDocIdForFilename = (filename: string): string => {
    const doc = documents.find((d) => d.filename.toLowerCase() === filename.toLowerCase());
    return doc ? doc.id : 'doc_ai_01';
  };

  // Render clickable citation badge from text pattern
  const renderMessageContent = (content: string, msg: ChatMessage) => {
    // Regex matching "(Source: filename, Page: X)"
    const citationRegex = /\(Source:\s*([^,]+),\s*Page:\s*(\d+)\)/gi;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = citationRegex.exec(content)) !== null) {
      // Text before citation
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }

      const filename = match[1].trim();
      const pageNum = parseInt(match[2].trim(), 10);
      const docId = getDocIdForFilename(filename);

      parts.push(
        <button
          key={`cite-${match.index}`}
          onClick={() => onOpenDocumentReader(docId, pageNum)}
          className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 text-xs font-semibold rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 transition-colors align-baseline"
          title={`Click to open ${filename} at Page ${pageNum}`}
        >
          <BookOpen className="h-3 w-3 inline" />
          <span>{filename} · p.{pageNum}</span>
        </button>
      );

      lastIndex = citationRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return (
      <div className="text-sm leading-relaxed whitespace-pre-wrap">
        {parts.map((p, idx) => (typeof p === 'string' ? <span key={idx}>{p}</span> : p))}
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-slate-50 dark:bg-slate-950">
      
      {/* Top Filter and Invariant Bar */}
      <div className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          
          {/* Course Scope Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 shrink-0">
              Scope:
            </span>
            <button
              onClick={() => setSelectedCourse('all')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedCourse === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              All Courses ({documents.length})
            </button>
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedCourse(doc.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  selectedCourse === doc.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {doc.code}: {doc.title.split('&')[0].trim()}
              </button>
            ))}
          </div>

          {/* Retrieval Engine Settings Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Sliders className="h-3.5 w-3.5 text-slate-500" />
              <span>RAG Config (k={topK})</span>
            </button>
          </div>

        </div>

        {/* Collapsible RAG Configuration Drawer */}
        {showConfig && (
          <div className="mx-auto mt-3 max-w-5xl rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Top-K Retrieved Chunks: {topK}
                </label>
                <input
                  type="range"
                  min="2"
                  max="6"
                  value={topK}
                  onChange={(e) => setTopK(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Higher k provides wider context; lower k maximizes precision.
                </span>
              </div>

              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Grounding Invariant
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Strict rejection if similarity &lt; 0.15. Direct source citation required on all claims.
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Vector Space Metric
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Normalized L2 Inner Product / Cosine Distance + TF-IDF Keyword Overlap.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Conversation Scroll View */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            const isExpanded = expandedChunksMessageId === message.id;

            return (
              <div
                key={message.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`relative max-w-2xl rounded-2xl p-4 sm:p-5 shadow-sm transition-all ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-none dark:bg-indigo-600'
                      : 'bg-white text-slate-900 border border-slate-200/80 rounded-bl-none dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800'
                  }`}
                >
                  {/* Message Header */}
                  <div className="flex items-center justify-between gap-4 mb-2 text-xs">
                    <span className={`font-semibold ${isUser ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'}`}>
                      {isUser ? 'You' : 'CampusGPT Assistant'}
                    </span>
                    <span className={`tabular-nums text-[11px] ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {message.timestamp}
                    </span>
                  </div>

                  {/* Body Text */}
                  {renderMessageContent(message.content, message)}

                  {/* Grounded Refusal Notice */}
                  {message.content.includes("I couldn't find that information") && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60">
                      <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block">Anti-Hallucination Guardrail Active</span>
                        <span>This query asks for topics outside your indexed university documents. CampusGPT refuses to fabricate facts.</span>
                      </div>
                    </div>
                  )}

                  {/* Grounding Transparency Bar for Assistant */}
                  {!isUser && message.retrievedChunks && message.retrievedChunks.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                        
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {message.latencyMs ? `${message.latencyMs}ms` : 'Retrieved'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{message.retrievedChunks.length} Chunks Used</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-[11px]">
                            Top Sim: {(message.retrievedChunks[0]?.score || 0).toFixed(3)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleSpeech(message.content, message.id)}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Read out loud"
                          >
                            {speakingId === message.id ? (
                              <VolumeX className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                            ) : (
                              <Volume2 className="h-3.5 w-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => copyToClipboard(message.content, message.id)}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Copy answer"
                          >
                            {copiedId === message.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() =>
                              setExpandedChunksMessageId(isExpanded ? null : message.id)
                            }
                            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                          >
                            <span>Inspect Chunks</span>
                            {isExpanded ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </button>
                        </div>

                      </div>

                      {/* Expanded Retrieved Chunks Inspector */}
                      {isExpanded && (
                        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                            Retrieved Chunks from Vector Index (Sorted by Similarity):
                          </span>
                          {message.retrievedChunks.map((chunk, cIdx) => {
                            const docId = getDocIdForFilename(chunk.source);
                            return (
                              <div
                                key={chunk.id || cIdx}
                                className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                              >
                                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                                  <div className="flex items-center gap-1.5 font-medium">
                                    <FileText className="h-3 w-3 text-indigo-500" />
                                    <span>{chunk.source}</span>
                                    <span>· Page {chunk.page}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                                      Score: {(chunk.score || 0).toFixed(3)}
                                    </span>
                                    <button
                                      onClick={() => onOpenDocumentReader(docId, chunk.page, chunk.id)}
                                      className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                                    >
                                      <span>View Page</span>
                                      <ExternalLink className="h-2.5 w-2.5" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-3 italic">
                                  "{chunk.text}"
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                    </div>
                  )}

                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex flex-col items-start">
              <div className="rounded-2xl rounded-bl-none border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-600 [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-600 [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-600"></div>
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Computing query embeddings & searching top-{topK} vector neighbors...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Academic Queries Strip (if few messages) */}
      {messages.length <= 3 && (
        <div className="border-t border-slate-200/60 bg-white px-4 py-2 dark:border-slate-800/60 dark:bg-slate-900/50">
          <div className="mx-auto flex max-w-4xl items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-400 whitespace-nowrap shrink-0">Try:</span>
            <button
              onClick={() => handleSendMessage('What is ML according to the AI textbook?')}
              className="rounded-full bg-slate-100 hover:bg-indigo-50 px-3 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
            >
              What is ML?
            </button>
            <button
              onClick={() => handleSendMessage('Explain ACID properties and transaction atomicity in DBMS')}
              className="rounded-full bg-slate-100 hover:bg-indigo-50 px-3 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
            >
              ACID Properties in DBMS
            </button>
            <button
              onClick={() => handleSendMessage('How does Banker\'s algorithm evaluate a safe state in OS?')}
              className="rounded-full bg-slate-100 hover:bg-indigo-50 px-3 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
            >
              Banker's Algorithm
            </button>
            <button
              onClick={() => handleSendMessage('What is the latest score in the IPL cricket match?')}
              className="rounded-full bg-slate-100 hover:bg-rose-50 px-3 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 border border-rose-200/40 dark:border-rose-900/40"
              title="Test refusal guardrail for out-of-domain query"
            >
              Test Refusal: IPL Score?
            </button>
          </div>
        </div>
      )}

      {/* Mode Selector and Input Form Bar */}
      <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3">
        
        {/* Mode Selector */}
        <div className="mx-auto flex max-w-4xl items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setChatMode('rag')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-colors ${
                chatMode === 'rag'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Grounded Course RAG</span>
            </button>

            <button
              type="button"
              onClick={() => setChatMode('search')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-colors ${
                chatMode === 'search'
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Google Search Grounded</span>
            </button>

            <button
              type="button"
              onClick={() => setChatMode('tutor')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-colors ${
                chatMode === 'tutor'
                  ? 'bg-white text-purple-600 shadow-sm dark:bg-slate-900 dark:text-purple-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Gemini AI Tutor</span>
            </button>
          </div>

          {chatMode === 'tutor' && (
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400">Role:</span>
              <select
                value={tutorRole}
                onChange={(e) => setTutorRole(e.target.value as any)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="general">Faculty Advisor (3.8 Flash)</option>
                <option value="fast">Fast Definitions (Flash Lite)</option>
                <option value="complex">Deep Reasoning (Argon / High)</option>
              </select>
            </div>
          )}

          {transcribing && (
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 animate-pulse">
              <Sparkles className="h-3 w-3" />
              <span>Transcribing voice with Gemini 3.5 Transcribe...</span>
            </span>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="mx-auto flex max-w-4xl items-center gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                chatMode === 'search'
                  ? 'Search Google live data with Gemini 3.8 Flash...'
                  : chatMode === 'tutor'
                  ? 'Chat multi-turn with customized academic role...'
                  : 'Ask questions strictly answered by course documents...'
              }
              disabled={loading || isRecording}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-400"
            />
          </div>

          {/* Microphone Recording Button */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all ${
              isRecording
                ? 'border-rose-500 bg-rose-500 text-white animate-pulse'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
            title={isRecording ? 'Stop recording voice' : 'Speak with microphone (Gemini 3.5 Transcribe)'}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          <button
            type="submit"
            disabled={!inputQuery.trim() || loading || isRecording}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-40 disabled:pointer-events-none dark:bg-indigo-500 dark:hover:bg-indigo-600 shrink-0"
            aria-label="Send query"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        <div className="mx-auto mt-2 flex max-w-4xl items-center justify-between text-[11px] text-slate-400">
          <span>
            {chatMode === 'search'
              ? 'Real-time Google Search Grounding enabled.'
              : chatMode === 'tutor'
              ? 'Multi-turn conversational memory active.'
              : `Grounded in ${documents.length} verified university course documents.`}
          </span>
          <span>Zero hallucination policy enabled.</span>
        </div>
      </div>

    </div>
  );
};
