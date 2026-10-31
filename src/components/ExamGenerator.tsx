import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Award,
  Layers
} from 'lucide-react';
import { AcademicDocument, ExamQuestion, Flashcard } from '../types/rag.ts';

interface ExamGeneratorProps {
  documents: AcademicDocument[];
  onOpenDocumentReader: (documentId: string, pageNumber: number) => void;
}

export const ExamGenerator: React.FC<ExamGeneratorProps> = ({
  documents,
  onOpenDocumentReader,
}) => {
  const [activeTab, setActiveTab] = useState<'exam' | 'flashcards'>('exam');
  const [selectedDocId, setSelectedDocId] = useState<string>('doc_ai_01');
  const [questionCount, setQuestionCount] = useState<number>(4);
  const [loading, setLoading] = useState<boolean>(false);

  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  // Quiz state
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState<boolean>(false);

  // Flashcards state
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [masteredCards, setMasteredCards] = useState<Record<string, boolean>>({});

  const generateMaterial = async (docId?: string) => {
    setLoading(true);
    setSubmittedQuiz(false);
    setUserAnswers({});
    setCurrentFlashcardIndex(0);
    setIsFlipped(false);

    try {
      const res = await fetch('/api/exam/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: docId || selectedDocId,
          count: questionCount,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate study materials');
      const data = await res.json();
      setQuestions(data.questions || []);
      setFlashcards(data.flashcards || []);
    } catch (err) {
      console.error('Exam generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateMaterial('doc_ai_01');
  }, []);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submittedQuiz) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const calculateScore = () => {
    let score = 0;
    for (const q of questions) {
      if (userAnswers[q.id] === q.correctAnswerIndex) {
        score++;
      }
    }
    return score;
  };

  const currentFlashcard = flashcards[currentFlashcardIndex];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <span>Automated Study & Assessment</span>
            <span aria-hidden="true">·</span>
            <span>Grounded In Course Documents</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Practice Exams & Concept Flashcards
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Generate rigorous university examination questions and revision decks verified against page excerpts.
          </p>
        </div>

        {/* Tab switch between Exam and Flashcards */}
        <div className="flex items-center rounded-lg bg-slate-100 p-1 dark:bg-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('exam')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'exam'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Practice Exam
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'flashcards'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Study Flashcards
          </button>
        </div>
      </div>

      {/* Generator Control Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Source Document:
              </label>
              <select
                value={selectedDocId}
                onChange={(e) => {
                  setSelectedDocId(e.target.value);
                  generateMaterial(e.target.value);
                }}
                className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 font-medium focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code}: {d.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Question Count:
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 font-medium focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value={4}>4 Questions</option>
                <option value={6}>6 Questions</option>
                <option value={8}>8 Questions</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => generateMaterial(selectedDocId)}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{loading ? 'Synthesizing with Gemini...' : 'Generate New Questions'}</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 mb-4 animate-spin">
            <RotateCw className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Extracting Invariants & Generating University Exam Items
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Grounding conceptual proofs, distractor options, and explanations into verified page citations.
          </p>
        </div>
      )}

      {/* Mode 1: Interactive Exam */}
      {!loading && activeTab === 'exam' && (
        <div className="space-y-6">
          
          {submittedQuiz && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-6 dark:border-indigo-900/60 dark:bg-indigo-950/40 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white dark:bg-indigo-500">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Exam Performance Evaluation
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Score: {calculateScore()} of {questions.length} Correct ({Math.round((calculateScore() / questions.length) * 100)}%)
                  </h3>
                </div>
              </div>

              <button
                onClick={() => {
                  setSubmittedQuiz(false);
                  setUserAnswers({});
                }}
                className="rounded-lg border border-indigo-300 bg-white px-4 py-2 text-xs font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50 dark:border-indigo-700 dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-slate-700"
              >
                Retake Exam
              </button>
            </div>
          )}

          <div className="space-y-6">
            {questions.map((q, idx) => {
              const selectedAnswer = userAnswers[q.id];
              const isAnswered = selectedAnswer !== undefined;
              const isCorrect = isAnswered && selectedAnswer === q.correctAnswerIndex;

              return (
                <div
                  key={q.id || idx}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 font-mono text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300 shrink-0">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                        {q.question}
                      </h3>
                    </div>

                    <button
                      onClick={() => onOpenDocumentReader(selectedDocId, q.page)}
                      className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0"
                    >
                      <BookOpen className="h-3 w-3" />
                      <span>p.{q.page}</span>
                    </button>
                  </div>

                  {/* Options */}
                  <div className="space-y-2.5 pl-9">
                    {q.options.map((opt, optIdx) => {
                      const isOptionSelected = selectedAnswer === optIdx;
                      let optionStyle =
                        'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200';

                      if (submittedQuiz) {
                        if (optIdx === q.correctAnswerIndex) {
                          optionStyle =
                            'border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-500/80 dark:bg-emerald-950/40 dark:text-emerald-200 font-medium';
                        } else if (isOptionSelected) {
                          optionStyle =
                            'border-rose-400 bg-rose-50 text-rose-900 dark:border-rose-500/80 dark:bg-rose-950/40 dark:text-rose-200';
                        }
                      } else if (isOptionSelected) {
                        optionStyle =
                          'border-indigo-600 bg-indigo-50/70 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-200 font-medium';
                      }

                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`flex items-center justify-between rounded-xl border p-3 text-xs cursor-pointer transition-colors ${optionStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-[10px] font-bold">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>

                          {submittedQuiz && optIdx === q.correctAnswerIndex && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          )}
                          {submittedQuiz && isOptionSelected && optIdx !== q.correctAnswerIndex && (
                            <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Grounded Explanation on Submit */}
                  {submittedQuiz && (
                    <div className="mt-4 ml-9 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-800/50 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                        <HelpCircle className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Pedagogical Explanation:</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {q.explanation}
                      </p>
                      <div className="text-[11px] text-slate-500 pt-1">
                        <span>Source: {q.source} · Page {q.page}</span>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {!submittedQuiz && questions.length > 0 && (
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setSubmittedQuiz(true)}
                disabled={Object.keys(userAnswers).length === 0}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-95 disabled:opacity-40 transition-all dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                Submit Exam for Evaluation
              </button>
            </div>
          )}

        </div>
      )}

      {/* Mode 2: Flashcards Flip Deck */}
      {!loading && activeTab === 'flashcards' && flashcards.length > 0 && (
        <div className="space-y-6">
          
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Card {currentFlashcardIndex + 1} of {flashcards.length}</span>
            <span className="font-mono">{currentFlashcard?.category}</span>
          </div>

          {/* Interactive Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="group relative h-72 sm:h-80 w-full cursor-pointer perspective-1000"
          >
            <div
              className={`relative h-full w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-lg transition-transform duration-500 [transform-style:preserve-3d] dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between ${
                isFlipped ? '[transform:rotateY(180deg)]' : ''
              }`}
            >
              
              {/* Front Face */}
              <div className={`flex flex-col justify-between h-full ${isFlipped ? 'invisible' : ''}`}>
                <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  <span>Concept & Definition</span>
                  <span className="text-slate-400 text-[11px]">Click to flip card</span>
                </div>

                <div className="my-auto text-center space-y-2">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    {currentFlashcard?.front}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Source: {currentFlashcard?.source} · Page {currentFlashcard?.page}
                  </span>
                </div>

                <div className="text-center text-[11px] text-slate-400">
                  Tap card to reveal verified course explanation
                </div>
              </div>

              {/* Back Face */}
              <div className={`absolute inset-0 p-8 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] ${!isFlipped ? 'invisible' : ''}`}>
                <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Grounded Explanation</span>
                  <span className="text-slate-400 text-[11px]">Page {currentFlashcard?.page}</span>
                </div>

                <div className="my-auto text-center space-y-3">
                  <p className="text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {currentFlashcard?.back}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDocumentReader(selectedDocId, currentFlashcard.page);
                    }}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <BookOpen className="h-3 w-3" />
                    <span>Open in Document Reader</span>
                  </button>
                  <span>Click to flip back</span>
                </div>
              </div>

            </div>
          </div>

          {/* Flashcard Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentFlashcardIndex((i) => Math.max(0, i - 1));
              }}
              disabled={currentFlashcardIndex === 0}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous Card</span>
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 text-xs font-semibold dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Flip Card</span>
            </button>

            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentFlashcardIndex((i) => Math.min(flashcards.length - 1, i + 1));
              }}
              disabled={currentFlashcardIndex >= flashcards.length - 1}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <span>Next Card</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
