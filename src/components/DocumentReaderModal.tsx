import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, BookOpen, FileText, Search, Sparkles } from 'lucide-react';
import { AcademicDocument, DocumentPage, DocumentChunk } from '../types/rag.ts';

interface DocumentReaderModalProps {
  document: AcademicDocument | null;
  initialPage: number;
  highlightChunkId?: string;
  onClose: () => void;
  onAskAboutPage: (question: string) => void;
}

export const DocumentReaderModal: React.FC<DocumentReaderModalProps> = ({
  document,
  initialPage,
  highlightChunkId,
  onClose,
  onAskAboutPage,
}) => {
  const [currentPageNum, setCurrentPageNum] = useState<number>(initialPage || 1);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (initialPage) {
      setCurrentPageNum(initialPage);
    }
  }, [initialPage, document]);

  if (!document) return null;

  const totalPages = document.pages.length;
  const currentPage: DocumentPage | undefined =
    document.pages.find((p) => p.pageNumber === currentPageNum) || document.pages[0];

  const pageChunks: DocumentChunk[] = document.chunks.filter(
    (c) => c.page === currentPageNum
  );

  const handlePrevPage = () => {
    if (currentPageNum > 1) setCurrentPageNum((p) => p - 1);
  };

  const handleNextPage = () => {
    if (currentPageNum < totalPages) setCurrentPageNum((p) => p + 1);
  };

  // Render page text with highlighting for search terms or chunk match
  const renderHighlightedText = (text: string) => {
    if (!searchTerm.trim()) {
      return (
        <div className="font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200">
          {text}
        </div>
      );
    }

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);

    return (
      <div className="font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200">
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100 px-0.5 rounded">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl transition-all dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {document.code}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{document.filename}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white truncate max-w-md">
                {document.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search within document */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Find in page..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
              aria-label="Close reader"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Reader Pager Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-2.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900 dark:text-white">
              Page {currentPageNum} of {totalPages}
            </span>
            <span className="text-slate-400">·</span>
            <span>{currentPage?.wordCount || 0} words</span>
            <span className="text-slate-400">·</span>
            <span>{pageChunks.length} indexed chunks</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPageNum <= 1}
              className="flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPageNum >= totalPages}
              className="flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Text Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="mx-auto max-w-3xl rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {currentPage ? (
              renderHighlightedText(currentPage.text)
            ) : (
              <p className="text-sm text-slate-500">Page text unavailable.</p>
            )}
          </div>

          {/* Extracted Chunks Breakdown for this Page */}
          <div className="mx-auto mt-6 max-w-3xl space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Vector Chunks for Page {currentPageNum}
            </h3>
            {pageChunks.map((chunk, idx) => (
              <div
                key={chunk.id}
                className={`rounded-lg border p-3 text-xs transition-colors ${
                  highlightChunkId === chunk.id
                    ? 'border-indigo-500 bg-indigo-50/50 dark:border-indigo-400 dark:bg-indigo-950/30'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                    Chunk #{idx + 1} ({chunk.id})
                  </span>
                  <span>Words {chunk.startWord} – {chunk.endWord}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 italic">
                  "{chunk.text}"
                </p>
                {chunk.topics && chunk.topics.length > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
                    <span>Topics:</span>
                    <span>{chunk.topics.join(' · ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            All text indexed in continuous high-dimensional vector space.
          </span>
          <button
            onClick={() => {
              onAskAboutPage(`Summarize key concepts from ${document.title} on Page ${currentPageNum}`);
              onClose();
            }}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ask About This Page</span>
          </button>
        </div>

      </div>
    </div>
  );
};
