/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { QuizData, StudentAnswers, StudentInfo } from './types';
import { emptyQuiz } from './utils/sampleData';
import { decodeQuizFromUrl } from './utils/urlSharing';
import { saveQuizToStorage } from './components/LibraryModal';
import { sound } from './utils/audio';
import { createAutoFittedMatrixForQuestions, ensureAllQuestionsInMatrix } from './utils/pixelText';

import { Navbar } from './components/Navbar';
import { MatrixGrid } from './components/MatrixGrid';
import { QuestionPanel } from './components/QuestionPanel';
import { QuizEditorModal } from './components/QuizEditorModal';
import { MatrixDesignerModal } from './components/MatrixDesignerModal';
import { ShareModal } from './components/ShareModal';
import { ExportModal } from './components/ExportModal';
import { LibraryModal } from './components/LibraryModal';
import { QuickImportModal } from './components/QuickImportModal';
import { Trophy } from 'lucide-react';

export default function App() {
  // Current active quiz - Starts BLANK by default as requested by user
  const [quiz, setQuiz] = useState<QuizData>(() => {
    const urlDecoded = decodeQuizFromUrl();
    if (urlDecoded) {
      return {
        ...urlDecoded.quiz,
        matrix: ensureAllQuestionsInMatrix(urlDecoded.quiz.matrix, urlDecoded.quiz.questions),
      };
    }
    return emptyQuiz;
  });

  // Student details - left blank for input
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    name: '',
    studentClass: '',
  });

  // Answers tracker
  const [answers, setAnswers] = useState<StudentAnswers>({});

  // Audio mute state
  const [isMuted, setIsMuted] = useState(false);

  // Active hover/highlight letter
  const [highlightLetter, setHighlightLetter] = useState<string | null>(null);

  // Live feedback toast
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(() => {
    const urlDecoded = decodeQuizFromUrl();
    return urlDecoded?.mode === 'edit';
  });
  const [isMatrixDesignerOpen, setIsMatrixDesignerOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareQuizTarget, setShareQuizTarget] = useState<QuizData | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isQuickImportOpen, setIsQuickImportOpen] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  // Handle URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const urlDecoded = decodeQuizFromUrl();
      if (urlDecoded) {
        setQuiz(urlDecoded.quiz);
        setAnswers({});
        setHasWon(false);
        if (urlDecoded.mode === 'edit') {
          setIsEditorOpen(true);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Compute unlocked letters based on correct answers
  const unlockedLetters = useMemo(() => {
    const set = new Set<string>();
    quiz.questions.forEach((q) => {
      if (answers[q.id]?.isCorrect) {
        set.add(q.cipherLetter.toUpperCase());
      }
    });
    return set;
  }, [quiz.questions, answers]);

  // Compute unlocked question orders (for exact cell-by-cell message coloring)
  const unlockedQuestionOrders = useMemo(() => {
    const set = new Set<number>();
    quiz.questions.forEach((q) => {
      if (answers[q.id]?.isCorrect) {
        set.add(q.order);
      }
    });
    return set;
  }, [quiz.questions, answers]);

  // Check if all questions in the quiz have been answered
  const isAllAnswered = useMemo(() => {
    const totalQuestions = quiz.questions.length;
    if (totalQuestions === 0) return true;
    const answeredCount = quiz.questions.filter(
      (q) => answers[q.id]?.selectedIndex !== undefined && answers[q.id]?.selectedIndex !== -1
    ).length;
    return answeredCount >= totalQuestions || hasWon;
  }, [quiz.questions, answers, hasWon]);

  // Handle option click
  const handleSelectOption = useCallback(
    (questionId: string, optionIndex: number) => {
      const question = quiz.questions.find((q) => q.id === questionId);
      if (!question) return;

      const isCorrect = question.correctOptionIndex === optionIndex;

      setAnswers((prev) => {
        const next = {
          ...prev,
          [questionId]: {
            selectedIndex: optionIndex,
            isCorrect,
          },
        };

        // Check if all questions are now answered correctly
        const totalCorrect = quiz.questions.filter((q) => {
          if (q.id === questionId) return isCorrect;
          return next[q.id]?.isCorrect;
        }).length;

        if (totalCorrect === quiz.questions.length && quiz.questions.length > 0) {
          setTimeout(() => {
            setHasWon(true);
            sound.playWin();
            confetti({
              particleCount: 150,
              spread: 80,
              origin: { y: 0.6 },
            });
          }, 400);
        }

        return next;
      });

      if (isCorrect) {
        sound.playCorrect();
        setFeedback({
          message: `Câu ${question.order} đúng! Đã giải mã và tô màu ${question.cipherColorName} cho các chữ tương ứng trên bảng ma trận.`,
          type: 'success',
        });
      } else {
        sound.playIncorrect();
        setFeedback({
          message: `Câu ${question.order} chưa chính xác. Bạn hãy chọn lại nhé!`,
          type: 'error',
        });
      }
    },
    [quiz.questions]
  );

  // Reset wrong answers
  const handleResetWrongAnswers = useCallback(() => {
    setAnswers((prev) => {
      const next: StudentAnswers = {};
      Object.entries(prev).forEach(([qId, ans]) => {
        if (ans.isCorrect) {
          next[qId] = ans;
        }
      });
      return next;
    });
    setFeedback({
      message: 'Đã đặt lại các câu chưa đúng. Hãy thử lại!',
      type: 'info',
    });
  }, []);

  // Reset all answers
  const handleResetAllAnswers = useCallback(() => {
    if (window.confirm('Bạn có chắc chắn muốn làm lại từ đầu không?')) {
      setAnswers({});
      setHasWon(false);
      setFeedback({
        message: 'Đã làm mới bài làm. Chúc bạn làm bài tốt!',
        type: 'info',
      });
    }
  }, []);

  const handleUpdateStudentInfo = (info: Partial<StudentInfo>) => {
    setStudentInfo((prev) => ({ ...prev, ...info }));
  };

  const handleSaveQuiz = (updatedQuiz: QuizData) => {
    const validatedQuiz: QuizData = {
      ...updatedQuiz,
      matrix: ensureAllQuestionsInMatrix(updatedQuiz.matrix, updatedQuiz.questions),
    };
    setQuiz(validatedQuiz);
    setAnswers({});
    setHasWon(false);
    saveQuizToStorage(validatedQuiz);
    setFeedback({
      message: `Đã lưu và cập nhật trò chơi: "${validatedQuiz.title || 'Bộ câu hỏi mới'}"!`,
      type: 'success',
    });
  };

  const handleQuickImportToApp = (
    newQuestions: any[],
    customTitle?: string,
    saveToLibrary?: boolean
  ) => {
    const updatedTitle = customTitle || quiz.title || 'BÀI TẬP VỀ ALKENE';
    const msg = updatedTitle.toUpperCase().includes('ALKENE') ? 'ALKENE' : (quiz.secretMessage || 'ALKENE');

    // Automatically create a perfectly fitted matrix for the new questions & topic
    const newMatrix = createAutoFittedMatrixForQuestions(newQuestions, msg);

    const updatedQuiz: QuizData = {
      ...quiz,
      id: saveToLibrary ? `quiz-${Date.now()}` : quiz.id,
      title: updatedTitle,
      secretMessage: msg,
      questions: newQuestions,
      matrix: newMatrix,
    };

    setQuiz(updatedQuiz);
    setAnswers({});
    setHasWon(false);
    saveQuizToStorage(updatedQuiz);
    setFeedback({
      message: saveToLibrary
        ? `Đã lưu thành công ${newQuestions.length} câu hỏi vào thư viện: "${updatedTitle}"!`
        : `Đã chuyển đổi và nạp ${newQuestions.length} câu hỏi vào đề hiện tại!`,
      type: 'success',
    });
  };

  const handleSaveMatrixDirectly = (newMatrix: any, generatedQuestions?: any) => {
    setQuiz((prev) => {
      const updated = {
        ...prev,
        matrix: newMatrix,
        questions:
          generatedQuestions && generatedQuestions.length > 0 && prev.questions.length === 0
            ? generatedQuestions
            : prev.questions,
      };
      saveQuizToStorage(updated);
      return updated;
    });
    setAnswers({});
    setHasWon(false);
    setFeedback({
      message: 'Đã tạo và cập nhật bảng ma trận thành công!',
      type: 'success',
    });
  };

  const handleSelectPresetQuiz = (newQuiz: QuizData) => {
    const validatedQuiz = {
      ...newQuiz,
      matrix: ensureAllQuestionsInMatrix(newQuiz.matrix, newQuiz.questions),
    };
    setQuiz(validatedQuiz);
    setAnswers({});
    setHasWon(false);
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen flex flex-col bg-gradient-to-br from-amber-50/40 via-sky-50/30 to-emerald-50/40 text-slate-800 font-sans overflow-y-auto lg:overflow-hidden">
      {/* Top Navbar */}
      <Navbar
        onOpenShareModal={() => {
          setShareQuizTarget(null);
          setIsShareOpen(true);
        }}
        onOpenEditorModal={() => setIsEditorOpen(true)}
        onOpenLibraryModal={() => setIsLibraryOpen(true)}
        onOpenExportModal={() => setIsExportOpen(true)}
        onOpenQuickImportModal={() => setIsQuickImportOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Quick Jump Bar for Mobile Devices (< lg) */}
      <div className="lg:hidden sticky top-16 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200/90 px-3 py-1.5 flex items-center justify-between gap-2 shadow-2xs shrink-0">
        <button
          type="button"
          onClick={() => {
            document.getElementById('printable-matrix-card')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex-1 py-1.5 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <span>🎨 Xem Ma Trận</span>
        </button>
        <button
          type="button"
          onClick={() => {
            document.getElementById('question-panel-card')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex-1 py-1.5 px-2.5 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <span>📝 Bảng Câu Hỏi ({quiz.questions.length})</span>
        </button>
      </div>

      {/* Main Dual-Panel Layout - 6:4 Ratio between Matrix (60%) and Questions (40%) on lg */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-2 sm:p-3 md:p-3.5 flex flex-col min-h-0 overflow-visible lg:overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-3 md:gap-4 flex-1 h-auto lg:h-full min-h-0 items-stretch overflow-visible lg:overflow-hidden">
          {/* Left Panel: Ma Trận Tô Màu (6 cols on lg = 60%) */}
          <div className="lg:col-span-6 flex flex-col min-h-[440px] sm:min-h-[480px] lg:min-h-0 h-auto lg:h-full overflow-visible lg:overflow-hidden">
            <MatrixGrid
              quiz={quiz}
              studentInfo={studentInfo}
              onUpdateStudentInfo={handleUpdateStudentInfo}
              unlockedLetters={unlockedLetters}
              unlockedQuestionOrders={unlockedQuestionOrders}
              highlightLetter={highlightLetter}
              onSelectCipher={(letter) => setHighlightLetter(letter === highlightLetter ? null : letter)}
              onOpenMatrixDesigner={() => setIsMatrixDesignerOpen(true)}
              isAllAnswered={isAllAnswered}
            />
          </div>

          {/* Right Panel: Bảng câu hỏi & Tùy chọn (4 cols on lg = 40%) */}
          <div className="lg:col-span-4 flex flex-col min-h-[520px] lg:min-h-0 h-auto lg:h-full overflow-visible lg:overflow-hidden">
            <QuestionPanel
              quiz={quiz}
              answers={answers}
              onSelectOption={handleSelectOption}
              onResetWrongAnswers={handleResetWrongAnswers}
              onResetAllAnswers={handleResetAllAnswers}
              onOpenExportModal={() => setIsExportOpen(true)}
              onOpenLibraryModal={() => setIsLibraryOpen(true)}
              onOpenEditorModal={() => setIsEditorOpen(true)}
              onOpenQuickImportModal={() => setIsQuickImportOpen(true)}
              lastFeedback={feedback}
              onHoverCipher={(letter) => setHighlightLetter(letter)}
            />
          </div>
        </div>
      </main>

      {/* Victory Celebration Modal */}
      {hasWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full text-center shadow-2xl border-4 border-amber-300 relative space-y-3.5 animate-in zoom-in-95">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center border-4 border-amber-300 shadow-sm">
              <Trophy className="w-8 h-8 text-amber-600 animate-bounce" />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Chúc mừng hoàn thành!
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-1.5">
                GIẢI MÃ THÀNH CÔNG!
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {studentInfo.name ? `Bạn ${studentInfo.name}` : 'Bạn'} đã trả lời chính xác tất cả câu hỏi và hé lộ thông điệp:
              </p>
            </div>

            <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 p-3.5 rounded-2xl border-2 border-amber-300">
              <span className="text-[11px] font-bold text-amber-800 uppercase block mb-0.5">
                Thông điệp bí mật:
              </span>
              <div className="text-lg sm:text-xl font-black text-rose-600 tracking-widest font-sans">
                {quiz.secretMessage || 'CHIẾN THẮNG'}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsExportOpen(true)}
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Xuất file Word bài làm
              </button>
              <button
                type="button"
                onClick={() => setHasWon(false)}
                className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      <QuizEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        quiz={quiz}
        onSaveQuiz={handleSaveQuiz}
      />

      {/* Direct Matrix Designer Modal */}
      <MatrixDesignerModal
        isOpen={isMatrixDesignerOpen}
        onClose={() => setIsMatrixDesignerOpen(false)}
        questions={quiz.questions}
        currentMatrix={quiz.matrix}
        secretMessage={quiz.secretMessage}
        onSaveMatrix={handleSaveMatrixDirectly}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => {
          setIsShareOpen(false);
          setShareQuizTarget(null);
        }}
        quiz={shareQuizTarget || quiz}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        quiz={quiz}
        studentInfo={studentInfo}
      />

      {/* Library Modal */}
      <LibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        currentQuizId={quiz.id}
        currentQuiz={quiz}
        onSelectQuiz={handleSelectPresetQuiz}
        onOpenCreateNew={() => {
          setIsLibraryOpen(false);
          setIsEditorOpen(true);
        }}
        onOpenShareModal={(quizToShare) => {
          setShareQuizTarget(quizToShare);
          setIsShareOpen(true);
        }}
      />

      {/* Quick Import from Word / Text Modal */}
      <QuickImportModal
        isOpen={isQuickImportOpen}
        onClose={() => setIsQuickImportOpen(false)}
        onImport={handleQuickImportToApp}
        initialTitle={quiz.title || 'HÓA HỌC 11 - ALKENE'}
      />
    </div>
  );
}
