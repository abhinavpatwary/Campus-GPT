import React, { useState } from 'react';
import {
  BookOpen,
  Upload,
  FileText,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  FileCheck,
  Sparkles,
  Sliders
} from 'lucide-react';
import { AcademicDocument } from '../types/rag.ts';

interface KnowledgeBankProps {
  documents: AcademicDocument[];
  onOpenDocumentReader: (documentId: string, pageNumber: number) => void;
  onRefreshDocuments: () => void;
}

export const KnowledgeBank: React.FC<KnowledgeBankProps> = ({
  documents,
  onOpenDocumentReader,
  onRefreshDocuments,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload modal state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCode, setUploadCode] = useState('CS-');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadText, setUploadText] = useState('');
  const [chunkSize, setChunkSize] = useState(150);
  const [overlap, setOverlap] = useState(30);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.topics.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      selectedCourseFilter === 'all' || doc.id === selectedCourseFilter || doc.code === selectedCourseFilter;

    return matchesSearch && matchesFilter;
  });

  const totalPages = documents.reduce((sum, d) => sum + d.pageCount, 0);
  const totalChunks = documents.reduce((sum, d) => sum + d.chunkCount, 0);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() && !uploadFile) {
      setUploadError('Please provide a document title or select a file.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      let fileBase64: string | undefined;

      if (uploadFile) {
        fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(uploadFile);
        });
      }

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadTitle || (uploadFile ? uploadFile.name.replace(/\.[^/.]+$/, '') : 'Custom Document'),
          code: uploadCode || 'CS-CUSTOM',
          description: uploadDesc || 'Custom uploaded course pack',
          filename: uploadFile ? uploadFile.name : `${uploadTitle.replace(/\s+/g, '_')}.txt`,
          fileBase64,
          textContent: uploadText,
          chunkSize,
          overlap,
        }),
      });

      if (!res.ok) {
        throw new Error(`Upload failed: status ${res.status}`);
      }

      // Reset form and close
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadFile(null);
      setUploadText('');
      onRefreshDocuments();
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this document from the vector knowledge base?')) {
      try {
        await fetch(`/api/documents/${id}`, { method: 'DELETE' });
        onRefreshDocuments();
      } catch (err) {
        alert('Failed to delete document: ' + (err as Error).message);
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <span>Knowledge Base Management</span>
            <span aria-hidden="true">·</span>
            <span>Vector Indexed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Academic Course Bank & Document Library
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Inspect verified university course packs, explore sliding-window chunk partitions, and ingest custom lecture materials.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all dark:bg-indigo-500 dark:hover:bg-indigo-600 self-start sm:self-auto shrink-0"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Course Pack</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Course Documents</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {documents.length}
            </span>
            <span className="text-xs text-slate-500">Active</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Indexed Pages</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {totalPages}
            </span>
            <span className="text-xs text-slate-500">Extracted</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Vector Chunks in Index</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400 tabular-nums">
              {totalChunks}
            </span>
            <span className="text-xs text-slate-500">Dense Vectors</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Chunk Window Formula</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              150w / 30w
            </span>
            <span className="text-xs text-slate-500">Size/Overlap</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents by course code, topic, or file..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setSelectedCourseFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedCourseFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            All Courses
          </button>
          {documents.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedCourseFilter(d.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedCourseFilter === d.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {d.code}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => onOpenDocumentReader(doc.id, 1)}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {doc.code}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {doc.filename}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {doc.title}
                  </h3>
                </div>
              </div>

              {doc.id.startsWith('doc_') && doc.code === 'USER-DOC' && (
                <button
                  onClick={(e) => handleDeleteDocument(doc.id, e)}
                  className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400 transition-colors"
                  title="Delete uploaded document"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
              {doc.description}
            </p>

            {/* Document Topics as unboxed text */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              {doc.topics.slice(0, 4).map((topic, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span aria-hidden="true">·</span>}
                  <span>{topic}</span>
                </React.Fragment>
              ))}
            </div>

            {/* Bottom Card Footer */}
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <span className="tabular-nums font-medium text-slate-900 dark:text-white">
                  {doc.pageCount} Pages
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-medium text-slate-900 dark:text-white">
                  {doc.chunkCount} Chunks
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400">{doc.uploadDate}</span>
              </div>

              <div className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                <span>Inspect Text & Chunks</span>
                <ExternalLink className="h-3 w-3" />
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Upload Course Document / Syllabus
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="mt-4 space-y-4">
              
              {uploadError && (
                <div className="rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
                  {uploadError}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Systems & Consensus"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    placeholder="CS-420"
                    value={uploadCode}
                    onChange={(e) => setUploadCode(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Upload PDF File or Syllabus Document
                </label>
                <input
                  type="file"
                  accept=".pdf,.txt,.md"
                  onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950 dark:file:text-indigo-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Or Paste Text / Exam Questions / Lecture Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste lecture notes or textbook markdown here..."
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
              </div>

              {/* Chunking Engine Tuning Controls */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Sliders className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Sliding Window Chunking Engine</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                      Chunk Size: <span className="font-mono font-semibold">{chunkSize} words</span>
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="300"
                      step="10"
                      value={chunkSize}
                      onChange={(e) => setChunkSize(parseInt(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                      Sliding Overlap: <span className="font-mono font-semibold">{overlap} words</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      step="5"
                      value={overlap}
                      onChange={(e) => setOverlap(parseInt(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  {isUploading ? 'Extracting & Indexing...' : 'Index Document Chunks'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
