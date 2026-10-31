/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, AppTab } from './components/Navbar.tsx';
import { LandingHero } from './components/LandingHero.tsx';
import { ChatWorkspace } from './components/ChatWorkspace.tsx';
import { KnowledgeBank } from './components/KnowledgeBank.tsx';
import { VectorVisualizer } from './components/VectorVisualizer.tsx';
import { ThreeDimensionalScene } from './components/ThreeDimensionalScene.tsx';
import { ScienceWorkbench } from './components/ScienceWorkbench.tsx';
import { ExamGenerator } from './components/ExamGenerator.tsx';
import { ArchitectureGuide } from './components/ArchitectureGuide.tsx';
import { DocumentReaderModal } from './components/DocumentReaderModal.tsx';
import { Footer } from './components/Footer.tsx';
import { AcademicDocument } from './types/rag.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('workspace');
  const [showHero, setShowHero] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [documents, setDocuments] = useState<AcademicDocument[]>([]);
  const [initialChatQuery, setInitialChatQuery] = useState<string | undefined>(undefined);

  // Document Reader Modal State
  const [readerModalDoc, setReaderModalDoc] = useState<AcademicDocument | null>(null);
  const [readerModalPage, setReaderModalPage] = useState<number>(1);
  const [readerModalChunkId, setReaderModalChunkId] = useState<string | undefined>(undefined);
  const [isReaderOpen, setIsReaderOpen] = useState<boolean>(false);

  // Sync dark mode class with documentElement
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Fetch documents from backend API
  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        // Now fetch full details for first few docs or store list
        const detailedDocs: AcademicDocument[] = await Promise.all(
          data.map(async (d: { id: string }) => {
            const detailRes = await fetch(`/api/documents/${d.id}`);
            return detailRes.ok ? await detailRes.json() : d;
          })
        );
        setDocuments(detailedDocs);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleStartChat = (query?: string) => {
    setActiveTab('workspace');
    setShowHero(false);
    if (query) {
      setInitialChatQuery(query);
    }
  };

  const handleExploreVectors = () => {
    setActiveTab('vector');
    setShowHero(false);
  };

  const handleOpenDocumentReader = (docId: string, pageNumber: number, chunkId?: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (doc) {
      setReaderModalDoc(doc);
      setReaderModalPage(pageNumber || 1);
      setReaderModalChunkId(chunkId);
      setIsReaderOpen(true);
    }
  };

  const handleAskAboutPage = (question: string) => {
    setIsReaderOpen(false);
    setActiveTab('workspace');
    setInitialChatQuery(question);
  };

  const handleNewSession = () => {
    setActiveTab('workspace');
    setShowHero(false);
    setInitialChatQuery('');
    // Trigger reset in ChatWorkspace by remounting or passing prop
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 font-sans">
      
      {/* 3-Zone Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setShowHero(false);
        }}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onNewSession={handleNewSession}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {/* Landing Hero Section (Visible when browsing or on first view) */}
        {showHero && activeTab === 'workspace' && (
          <LandingHero
            onStartChat={handleStartChat}
            onExploreVectors={handleExploreVectors}
          />
        )}

        {/* Tab 1: Chat Workspace */}
        {activeTab === 'workspace' && (
          <ChatWorkspace
            documents={documents}
            onOpenDocumentReader={handleOpenDocumentReader}
            initialQuery={initialChatQuery}
          />
        )}

        {/* Tab 2: Knowledge Bank */}
        {activeTab === 'knowledge' && (
          <KnowledgeBank
            documents={documents}
            onOpenDocumentReader={handleOpenDocumentReader}
            onRefreshDocuments={fetchDocuments}
          />
        )}

        {/* Tab 3: 2D Vector Visualizer */}
        {activeTab === 'vector' && (
          <VectorVisualizer
            documents={documents}
            onOpenDocumentReader={handleOpenDocumentReader}
          />
        )}

        {/* Tab 4: 3D Neural Citadel (Three.js WebGL) */}
        {activeTab === 'three' && <ThreeDimensionalScene />}

        {/* Tab 5: Bioscience & Chemistry Workbench */}
        {activeTab === 'science' && <ScienceWorkbench />}

        {/* Tab 6: Practice Exam & Flashcards */}
        {activeTab === 'exam' && (
          <ExamGenerator
            documents={documents}
            onOpenDocumentReader={handleOpenDocumentReader}
          />
        )}

        {/* Tab 7: Architecture & API Documentation */}
        {activeTab === 'architecture' && <ArchitectureGuide />}
      </main>

      {/* Synchronized Document Reader Modal */}
      {isReaderOpen && (
        <DocumentReaderModal
          document={readerModalDoc}
          initialPage={readerModalPage}
          highlightChunkId={readerModalChunkId}
          onClose={() => setIsReaderOpen(false)}
          onAskAboutPage={handleAskAboutPage}
        />
      )}

      {/* Professional Footer */}
      <Footer
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setShowHero(false);
        }}
      />

    </div>
  );
}
