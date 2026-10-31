import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, XCircle, Search, ShieldCheck, Zap, Database, Cpu } from 'lucide-react';

interface LandingHeroProps {
  onStartChat: (initialQuery?: string) => void;
  onExploreVectors: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onStartChat, onExploreVectors }) => {
  const [quickQuery, setQuickQuery] = useState('');

  const sampleQueries = [
    'What is the difference between AI and Machine Learning?',
    'Explain ACID properties and 2PL in DBMS',
    'How does Banker\'s algorithm prevent deadlock?',
    'What is RAG and why is it used with LLMs?',
  ];

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      onStartChat(quickQuery.trim());
    }
  };

  return (
    <div className="relative overflow-hidden border-b border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
      
      {/* Hero Grid Container */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          
          {/* Left Column: Headline and Positioning */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              <span>Grounded University RAG Architecture</span>
              <span aria-hidden="true">·</span>
              <span>Gemini 3.8 Flash Powered</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-5xl dark:text-white" style={{ textWrap: 'balance' }}>
              Academic Document Intelligence with Strict Page Citations
            </h1>

            <p className="text-base text-slate-600 sm:text-lg dark:text-slate-300">
              Stop guessing if AI is hallucinating course material. CampusGPT parses your course textbooks, question banks, and lecture slides into normalized vector chunks. Every answer quotes the exact source file and page, with a strict refusal guardrail for out-of-context queries.
            </p>

            {/* Interactive Query Input Bar */}
            <form onSubmit={handleQuickSubmit} className="relative mt-2 max-w-xl">
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  placeholder="Ask any question from your course texts (e.g. What is ML?)..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3.5 pl-11 pr-28 text-sm text-slate-900 shadow-sm transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:focus:border-indigo-400 dark:focus:bg-slate-800"
                />
                <button
                  type="submit"
                  className="absolute right-2 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  <span>Query</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>

            {/* Sample Prompt Chips */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Try verified student queries:
              </span>
              <div className="flex flex-wrap gap-2">
                {sampleQueries.map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => onStartChat(query)}
                    className="text-left text-xs text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50/60 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80 dark:hover:text-indigo-400 rounded-md px-2.5 py-1.5 transition-colors border border-slate-200/60 dark:border-slate-700"
                  >
                    "{query}"
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onStartChat()}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                <span>Launch RAG Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={onExploreVectors}
                className="flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span>Explore Vector Space</span>
              </button>
            </div>

          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-xl dark:border-slate-800 dark:bg-slate-800">
              <img
                src="/src/assets/images/campusgpt_hero_visual_1793428539633.jpg"
                alt="University research commons with students collaborating with digital study materials"
                className="h-80 sm:h-96 w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-slate-900/85 backdrop-blur-md p-4 text-white border border-white/10 shadow-lg">
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                  <span className="font-semibold text-indigo-400">Live Grounding Invariant</span>
                  <span className="font-mono tabular-nums text-emerald-400">Similarity 0.695</span>
                </div>
                <p className="text-xs text-slate-200 italic line-clamp-2">
                  "Machine Learning (ML) is a subset of AI in which systems learn patterns from data instead of relying only on explicitly written rules."
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Source: AI_data.pdf · Page 1</span>
                  <span className="text-emerald-400 font-mono">100% Grounded</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 4-Column Metric Strip (Full width below hero split) */}
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 border-t border-slate-200 pt-8 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">100%</span>
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Grounded Citations</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Exact file & page attribution for every asserted fact.</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <XCircle className="h-4 w-4" />
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">0%</span>
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Hallucination Guard</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Strict refusal when queries exceed course scope.</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Cpu className="h-4 w-4" />
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">128-Dim</span>
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Vector Embeddings</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">L2-normalized cosine distance for semantic clustering.</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Zap className="h-4 w-4" />
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">&lt; 600ms</span>
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Retrieval Latency</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Top-k chunk retrieval with real-time scoring.</p>
          </div>
        </div>

      </div>

    </div>
  );
};
