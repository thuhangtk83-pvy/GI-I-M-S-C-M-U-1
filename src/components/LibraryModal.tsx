import React, { useRef, useState } from 'react';
import {
  X,
  BookOpen,
  Plus,
  Upload,
  Trash2,
  Sparkles,
  Layers,
  FolderOpen,
  Save,
  Download,
  FileText,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { QuizData, Question } from '../types';
import { createAutoFittedMatrixForQuestions, ensureAllQuestionsInMatrix } from '../utils/pixelText';
import { encodeQuizToUrl } from '../utils/urlSharing';
import { QuickImportModal } from './QuickImportModal';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuizId: string;
  currentQuiz?: QuizData;
  onSelectQuiz: (quiz: QuizData) => void;
  onOpenCreateNew: () => void;
  onOpenShareModal?: (quiz: QuizData) => void;
}

const STORAGE_KEY = 'color_matrix_saved_quizzes_v1';

export function getSavedQuizzesFromStorage(): QuizData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveQuizToStorage(quiz: QuizData) {
  try {
    const current = getSavedQuizzesFromStorage();
    const existingIndex = current.findIndex((q) => q.id === quiz.id);
    if (existingIndex >= 0) {
      current[existingIndex] = quiz;
    } else {
      current.unshift(quiz);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
  isOpen,
  onClose,
  currentQuizId,
  currentQuiz,
  onSelectQuiz,
  onOpenCreateNew,
  onOpenShareModal,
}) => {
  const [savedQuizzes, setSavedQuizzes] = useState<QuizData[]>(() => getSavedQuizzesFromStorage());
  const [isQuickImportOpen, setIsQuickImportOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  const handleShareQuizFromLibrary = (quizToShare: QuizData, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenShareModal) {
      onOpenShareModal(quizToShare);
      return;
    }
    const origin = window.location.origin + window.location.pathname;
    const shareUrl = (quizToShare.id === 'hoa-hoc-11-alkene' || quizToShare.id === 'protein-enzyme-12' || quizToShare.id === 'sinh-hoc-te-bao')
      ? `${origin}#preset=${quizToShare.id}`
      : encodeQuizToUrl(quizToShare, 'play');

    navigator.clipboard.writeText(shareUrl).then(() => {
      showNotification(`Đã sao chép link chơi đề "${quizToShare.title}"! Bạn có thể dán link gửi ngay cho học sinh.`);
    }).catch(() => {
      showNotification(`Link: ${shareUrl}`);
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc muốn xóa bộ câu hỏi này không?')) {
      const updated = savedQuizzes.filter((q) => q.id !== id);
      setSavedQuizzes(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      showNotification('Đã xóa bộ đề khỏi thư viện.');
    }
  };

  const handleSaveCurrentQuizToLibrary = () => {
    if (!currentQuiz) return;
    const title = currentQuiz.title?.trim() || prompt('Nhập tên bộ đề để lưu vào thư viện:') || 'Bộ đề mới tạo';
    const quizToSave: QuizData = {
      ...currentQuiz,
      id: currentQuiz.id.startsWith('empty') || currentQuiz.id === 'default' ? `quiz-${Date.now()}` : currentQuiz.id,
      title,
    };
    saveQuizToStorage(quizToSave);
    const updated = getSavedQuizzesFromStorage();
    setSavedQuizzes(updated);
    showNotification(`Đã thêm thành công đề "${title}" vào thư viện!`);
  };

  const handleDownloadJson = (quiz: QuizData, e: React.MouseEvent) => {
    e.stopPropagation();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(quiz, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${quiz.title || 'de_thi'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as QuizData;
        if (parsed.questions && parsed.matrix) {
          saveQuizToStorage(parsed);
          setSavedQuizzes(getSavedQuizzesFromStorage());
          onSelectQuiz(parsed);
          showNotification(`Đã nạp file và lưu đề "${parsed.title || 'Mới'}" vào thư viện!`);
        } else {
          alert('File JSON không hợp lệ hoặc thiếu cấu trúc bài thi.');
        }
      } catch (err) {
        alert('Lỗi đọc file JSON: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const handleQuickImportSave = (questions: Question[], quizTitle?: string, saveToLibrary?: boolean) => {
    const title = quizTitle || 'Bài tập trắc nghiệm mới';
    const msg = title.toUpperCase().includes('ALKENE') ? 'ALKENE' : (currentQuiz?.secretMessage || 'ALKENE');
    const autoMatrix = createAutoFittedMatrixForQuestions(questions, msg);
    const newQuiz: QuizData = {
      id: `quiz-imported-${Date.now()}`,
      title,
      subject: currentQuiz?.subject || 'Hóa học',
      grade: currentQuiz?.grade || 'Lớp 11',
      secretMessage: msg,
      questions,
      matrix: autoMatrix,
    };

    saveQuizToStorage(newQuiz);
    setSavedQuizzes(getSavedQuizzesFromStorage());
    onSelectQuiz(newQuiz);
    showNotification(`Đã thêm thành công đề mới "${newQuiz.title}" vào thư viện!`);
  };

  const displayedList = savedQuizzes;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-200" />
              <div>
                <h3 className="font-extrabold text-base sm:text-lg">Thư viện bài tập ma trận</h3>
                <p className="text-xs text-purple-200">Quản lý và thêm đề thi mới vào thư viện</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Feedback banner */}
          {statusMessage && (
            <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-inner">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Action bar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs sm:text-sm text-slate-700">
                Danh sách đề thi đã lưu ({savedQuizzes.length})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {/* Button: Thêm đề đang mở vào thư viện */}
              {currentQuiz && (
                <button
                  type="button"
                  onClick={handleSaveCurrentQuizToLibrary}
                  className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                  title="Lưu bộ đề đang mở trên màn hình vào thư viện"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu đề hiện tại vào TV</span>
                </button>
              )}

              {/* Button: Nhập từ Word */}
              <button
                type="button"
                onClick={() => setIsQuickImportOpen(true)}
                className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                title="Dán câu hỏi Word (hỗ trợ công thức hóa học CₙH₂ₙ, C₂H₄...) và lưu vào thư viện"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Nhập từ Word</span>
              </button>

              {/* Button: Tạo đề mới */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCreateNew();
                }}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo đề mới</span>
              </button>

              {/* Button: Nạp file .json */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                title="Nạp file .json bài thi từ máy tính"
              >
                <Upload className="w-3.5 h-3.5 text-purple-600" />
                <span>Nạp .json</span>
              </button>
            </div>
          </div>

          {/* Quizzes List */}
          <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
            {displayedList.length === 0 ? (
              <div className="py-12 text-center space-y-2.5">
                <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">
                  Thư viện chưa có bộ đề nào được lưu.
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Hãy nhấp vào <strong>"Nhập từ Word"</strong> (hỗ trợ Alkene, Hóa học) hoặc <strong>"Tạo đề mới"</strong> để lưu đề vào thư viện của bạn.
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsQuickImportOpen(true)}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Dán đề từ Word ngay</span>
                  </button>
                </div>
              </div>
            ) : (
              displayedList.map((q) => {
                const isCurrent = q.id === currentQuizId;

                return (
                  <div
                    key={q.id}
                    onClick={() => {
                      onSelectQuiz(q);
                      onClose();
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      isCurrent
                        ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-500 shadow-xs'
                        : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900">
                          {q.title || 'Chủ đề chưa đặt tên'}
                        </span>
                        {isCurrent && (
                          <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Đang chọn
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        {q.subject && (
                          <span className="bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded text-[11px]">
                            {q.subject}
                          </span>
                        )}
                        {q.grade && (
                          <span className="bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded text-[11px]">
                            {q.grade}
                          </span>
                        )}
                        <span>• {q.questions?.length || 0} câu hỏi</span>
                        {q.secretMessage && (
                          <span>
                            • Mật mã: <strong className="text-rose-600">{q.secretMessage}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectQuiz(q);
                          onClose();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-purple-600 hover:text-white'
                        }`}
                      >
                        {isCurrent ? 'Đang mở' : 'Mở đề này'}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleShareQuizFromLibrary(q, e)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Chia sẻ link chơi đề này cho học sinh"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Chia sẻ link</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDownloadJson(q, e)}
                        className="p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Tải file .json về máy"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDelete(q.id, e)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa đề này khỏi thư viện"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Nested QuickImportModal inside Library */}
      <QuickImportModal
        isOpen={isQuickImportOpen}
        onClose={() => setIsQuickImportOpen(false)}
        onImport={handleQuickImportSave}
        initialTitle="HÓA HỌC 11 - ALKENE"
      />
    </>
  );
};
