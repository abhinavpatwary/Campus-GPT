import React from 'react';
import { GraduationCap } from 'lucide-react';
import { AppTab } from './Navbar.tsx';

interface FooterProps {
  onSelectTab: (tab: AppTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 transition-colors dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white dark:bg-indigo-500">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              CampusGPT
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Academic RAG & Document Intelligence Platform
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 dark:text-slate-400">
            <button
              onClick={() => onSelectTab('workspace')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Workspace
            </button>
            <button
              onClick={() => onSelectTab('knowledge')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Knowledge Bank
            </button>
            <button
              onClick={() => onSelectTab('vector')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Vector Space
            </button>
            <button
              onClick={() => onSelectTab('three')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              3D Citadel
            </button>
            <button
              onClick={() => onSelectTab('science')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Bioscience
            </button>
            <button
              onClick={() => onSelectTab('exam')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Exam Prep
            </button>
            <button
              onClick={() => onSelectTab('architecture')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Architecture & API
            </button>
          </div>

          <div className="text-xs text-slate-400">
            © 2026 CampusGPT. University Research Edition.
          </div>

        </div>
      </div>
    </footer>
  );
};
