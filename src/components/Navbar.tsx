import React from 'react';
import { BookOpen, Moon, Sun, Sparkles, Plus, GraduationCap } from 'lucide-react';

export type AppTab = 'workspace' | 'knowledge' | 'vector' | 'three' | 'science' | 'exam' | 'architecture';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onNewSession: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  onNewSession,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Single text element brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm dark:bg-indigo-500">
            <GraduationCap className="h-5 w-5" />
          </div>
          <button 
            onClick={() => setActiveTab('workspace')}
            className="text-left cursor-pointer group"
          >
            <span className="text-lg font-bold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400 whitespace-nowrap shrink-0">
              CampusGPT
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              Academic Platform
            </span>
          </button>
        </div>

        {/* Zone 2: Single-line clean navigation links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'workspace'
                ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-white'
                : 'hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50'
            }`}
          >
            Workspace
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'knowledge'
                ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-white'
                : 'hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50'
            }`}
          >
            Knowledge Bank
          </button>

          <button
            onClick={() => setActiveTab('vector')}
            className={`px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'vector'
                ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-white'
                : 'hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50'
            }`}
          >
            Vector Space
          </button>

          <button
            onClick={() => setActiveTab('three')}
            className={`px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'three'
                ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-white'
                : 'hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50'
            }`}
          >
            3D Citadel
          </button>

          <button
            onClick={() => setActiveTab('science')}
            className={`px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'science'
                ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-white'
                : 'hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50'
            }`}
          >
            Bioscience
          </button>

          <button
            onClick={() => setActiveTab('exam')}
            className={`px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'exam'
                ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-white'
                : 'hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50'
            }`}
          >
            Exam Prep
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'architecture'
                ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-white'
                : 'hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50'
            }`}
          >
            Architecture
          </button>
        </nav>

        {/* Zone 3: 1 primary action + theme toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            onClick={onNewSession}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95 whitespace-nowrap shrink-0 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Session</span>
          </button>
        </div>

      </div>

      {/* Mobile sub-bar */}
      <div className="flex lg:hidden items-center justify-around border-t border-slate-200 px-2 py-1.5 dark:border-slate-800 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('workspace')}
          className={`px-2 py-1 font-medium whitespace-nowrap shrink-0 rounded ${activeTab === 'workspace' ? 'text-indigo-600 font-bold dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`px-2 py-1 font-medium whitespace-nowrap shrink-0 rounded ${activeTab === 'knowledge' ? 'text-indigo-600 font-bold dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}
        >
          Docs
        </button>
        <button
          onClick={() => setActiveTab('vector')}
          className={`px-2 py-1 font-medium whitespace-nowrap shrink-0 rounded ${activeTab === 'vector' ? 'text-indigo-600 font-bold dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}
        >
          Vectors
        </button>
        <button
          onClick={() => setActiveTab('three')}
          className={`px-2 py-1 font-medium whitespace-nowrap shrink-0 rounded ${activeTab === 'three' ? 'text-indigo-600 font-bold dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}
        >
          3D Citadel
        </button>
        <button
          onClick={() => setActiveTab('science')}
          className={`px-2 py-1 font-medium whitespace-nowrap shrink-0 rounded ${activeTab === 'science' ? 'text-indigo-600 font-bold dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}
        >
          Science
        </button>
        <button
          onClick={() => setActiveTab('exam')}
          className={`px-2 py-1 font-medium whitespace-nowrap shrink-0 rounded ${activeTab === 'exam' ? 'text-indigo-600 font-bold dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}
        >
          Exams
        </button>
      </div>
    </header>
  );
};
