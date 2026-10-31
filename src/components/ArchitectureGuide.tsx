import React, { useState, useEffect } from 'react';
import {
  Layers,
  FileText,
  Cpu,
  Database,
  Search,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Terminal,
  Activity
} from 'lucide-react';
import { SystemStats } from '../types/rag.ts';

export const ArchitectureGuide: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'api' | 'math'>('pipeline');

  useEffect(() => {
    fetch('/api/system/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to load system stats:', err));
  }, []);

  const pipelineSteps = [
    {
      num: '01',
      title: 'PDF Parsing & Page-Level Extraction',
      description: 'Documents are loaded page-by-page, extracting clean unicode text while strictly preserving page boundaries and metadata.',
      detail: 'Maps file inputs into structured [{ source: filename, page: N, text: ... }]. Handles multi-page course materials without losing origin coordinates.',
      icon: FileText,
    },
    {
      num: '02',
      title: 'Sliding-Window Word Chunking',
      description: 'Page texts are partitioned into overlapping chunks with configurable window size (default 150 words) and sliding overlap (30 words).',
      detail: 'Ensures conceptual continuity across paragraph and sentence boundaries, avoiding fragmented explanations during retrieval.',
      icon: Layers,
    },
    {
      num: '03',
      title: 'High-Dimensional Vector Embeddings',
      description: 'Text chunks are encoded into continuous multidimensional vector representations where semantic proximity correlates with conceptual alignment.',
      detail: 'Powered by Gemini Embeddings (gemini-embedding-2-preview) normalized to unit length: ||v||2 = 1.0.',
      icon: Cpu,
    },
    {
      num: '04',
      title: 'Vector Index & Cosine Similarity',
      description: 'Indexed in vector space (FAISS FlatIP). Query embedding is generated at inference time; inner product directly equals cosine similarity.',
      detail: 'Computes dot(q, c) with O(K) nearest neighbor selection, augmented with lexical term-frequency boosting for technical nomenclature.',
      icon: Database,
    },
    {
      num: '05',
      title: 'Grounded Prompt Engineering',
      description: 'Top-k retrieved chunks are injected into a constrained academic prompt instructing the model to cite every claim or refuse out-of-context queries.',
      detail: 'Enforces strict format: (Source: file.pdf, Page: X) and refusal response: "I couldn\'t find that information in the uploaded PDF(s)."',
      icon: ShieldCheck,
    },
    {
      num: '06',
      title: 'Pedagogical Answer Synthesis',
      description: 'Gemini 3.8 Flash synthesizes the verified answer in sub-second latency, providing interactive citations that sync directly to the document reader.',
      detail: 'Answers include source badges, similarity scores, word counts, and text-to-speech audio synthesis.',
      icon: MessageSquare,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <span>System Architecture & Engineering</span>
          <span aria-hidden="true">·</span>
          <span>Notebook Reference Implementation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          CampusGPT Core RAG Architecture
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Detailed technical specifications of the 6-stage retrieval-augmented generation pipeline, vector math invariants, and REST API contracts.
        </p>
      </div>

      {/* Live System Health & Telemetry Card */}
      {stats && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>RAG Engine Operational</span>
            </span>
            <span className="font-mono text-[11px]">Model: {stats.geminiModel}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <span className="text-[11px] text-slate-400 block">Total Documents</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                {stats.totalDocuments} Course Packs
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Indexed Chunks</span>
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                {stats.totalChunks} Chunks
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Average Latency</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                {stats.avgLatencyMs} ms
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Vector Dimensions</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                {stats.embeddingDimensions} Dim L2
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`pb-3 text-xs font-semibold transition-colors border-b-2 ${
            activeTab === 'pipeline'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          Pipeline Stages (Notebook Flow)
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`pb-3 text-xs font-semibold transition-colors border-b-2 ${
            activeTab === 'api'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          REST API Specification
        </button>
        <button
          onClick={() => setActiveTab('math')}
          className={`pb-3 text-xs font-semibold transition-colors border-b-2 ${
            activeTab === 'math'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          Vector Math Invariants
        </button>
      </div>

      {/* Tab 1: Pipeline Breakdown */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          {pipelineSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row items-start gap-4"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 shrink-0">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      STAGE {step.num}
                    </span>
                    <span className="text-slate-400">·</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    {step.description}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                    {step.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: REST API Endpoints */}
      {activeTab === 'api' && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="p-3.5">Method</th>
                <th className="p-3.5">Endpoint</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Payload / Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">POST</td>
                <td className="p-3.5 font-mono">/api/rag/query</td>
                <td className="p-3.5">Executes top-k retrieval and synthesizes grounded answer with citations.</td>
                <td className="p-3.5 font-mono text-[11px] text-slate-500">{'{ question, courseFilter, topK }'}</td>
              </tr>
              <tr>
                <td className="p-3.5 font-mono text-blue-600 dark:text-blue-400 font-bold">GET</td>
                <td className="p-3.5 font-mono">/api/documents</td>
                <td className="p-3.5">Returns all indexed course packs, metadata, page counts, chunk stats.</td>
                <td className="p-3.5 font-mono text-[11px] text-slate-500">AcademicDocument[]</td>
              </tr>
              <tr>
                <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">POST</td>
                <td className="p-3.5 font-mono">/api/documents/upload</td>
                <td className="p-3.5">Ingests user PDF or markdown, chunks with sliding window, computes vectors.</td>
                <td className="p-3.5 font-mono text-[11px] text-slate-500">{'{ title, fileBase64, chunkSize, overlap }'}</td>
              </tr>
              <tr>
                <td className="p-3.5 font-mono text-blue-600 dark:text-blue-400 font-bold">GET</td>
                <td className="p-3.5 font-mono">/api/rag/vector-map</td>
                <td className="p-3.5">Returns 2D projected coordinates for chunk nodes and active query vector.</td>
                <td className="p-3.5 font-mono text-[11px] text-slate-500">{'{ nodes: [...], queryNode }'}</td>
              </tr>
              <tr>
                <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">POST</td>
                <td className="p-3.5 font-mono">/api/exam/generate</td>
                <td className="p-3.5">Synthesizes university exam items and flashcards with source citations.</td>
                <td className="p-3.5 font-mono text-[11px] text-slate-500">{'{ documentId, count }'}</td>
              </tr>
              <tr>
                <td className="p-3.5 font-mono text-blue-600 dark:text-blue-400 font-bold">GET</td>
                <td className="p-3.5 font-mono">/api/health</td>
                <td className="p-3.5">Verifies server uptime, memory usage, and Gemini client configuration.</td>
                <td className="p-3.5 font-mono text-[11px] text-slate-500">{'{ status: "healthy", uptime }'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Mathematical Formalism */}
      {activeTab === 'math' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              1. L2 Vector Normalization Invariant
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Before storing chunk vectors in the index, all vectors are projected to unit length:
            </p>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl font-mono text-xs text-indigo-600 dark:text-indigo-400">
              {'v_norm = v / ||v||₂ = v / sqrt( ∑ v_i² )'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Under unit normalization, the Euclidean distance between two vectors is monotonically related to their dot product:
              <br />
              <code className="font-mono mt-1 inline-block text-slate-700 dark:text-slate-300">
                {'||u - v||² = 2 - 2(u · v)'}
              </code>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              2. Cosine Similarity via Inner Product
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Retrieval performs maximum inner product search (MIPS) against normalized embeddings:
            </p>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl font-mono text-xs text-indigo-600 dark:text-indigo-400">
              {'Score(q, c_i) = q · c_i = cos(θ)'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The top-k candidate chunks are ranked in descending order of similarity score s in [-1, 1]. Chunks with s &lt; 0.15 are filtered out to prevent hallucinated answers.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
