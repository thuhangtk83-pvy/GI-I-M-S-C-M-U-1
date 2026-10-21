import React, { useRef } from 'react';
import { QuizData, StudentAnswers } from '../types';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Download,
  BookOpen,
  CheckCircle2,
  XCircle,
  Sparkles,
  PlusCircle,
  FileText,
} from 'lucide-react';

interface QuestionPanelProps {
  quiz: QuizData;
  answers: StudentAnswers;
  onSelectOption: (questionId: string, optionIndex: number) => void;
  onResetWrongAnswers: () => void;
  onResetAllAnswers: () => void;
  onOpenExportModal: () => void;
  onOpenLibraryModal: () => void;
  onOpenEditorModal: () => void;
  onOpenQuickImportModal?: () => void;
  lastFeedback: { message: string; type: 'success' | 'error' | 'info' } | null;
  onHoverCipher?: (letter: string | null) => void;
}

export const QuestionPanel: React.FC<QuestionPanelProps> = ({
  quiz,
  answers,
  onSelectOption,
  onResetWrongAnswers,
  onResetAllAnswers,
  onOpenExportModal,
  onOpenLibraryModal,
  onOpenEditorModal,
  onOpenQuickImportModal,
  lastFeedback,
  onHoverCipher,
}) => {
  const [zoomLevel, setZoomLevel] = React.useState<number>(100);
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalQuestions = quiz.questions.length;
  const correctCount = Object.values(answers).filter((a) => a.isCorrect).length;
  const wrongCount = Object.values(answers).filter((a) => !a.isCorrect && a.selectedIndex !== -1).length;

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(125, Math.max(85, prev + delta)));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      id="question-panel-card"
      ref={containerRef}
      className="bg-white rounded-2xl shadow-md border-2 border-sky-200 p-3 sm:p-4 flex flex-col h-full max-h-full overflow-hidden select-none"
    >
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-sky-100 shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <h1 className="text-base sm:text-lg md:text-xl font-black text-sky-950 uppercase tracking-tight truncate">
            {quiz.title || 'CHỦ ĐỀ CHƯA ĐẶT TÊN (ĐỂ TRỐNG)'}
          </h1>
        </div>

        {/* Action icons & score badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-semibold text-slate-700">
            <button
              onClick={() => handleZoom(-10)}
              className="p-1 hover:bg-white rounded transition-colors"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 min-w-[36px] text-center text-[11px]">{zoomLevel}%</span>
            <button
              onClick={() => handleZoom(10)}
              className="p-1 hover:bg-white rounded transition-colors"
              title="Phóng to"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Quick Import from Word button */}
          {onOpenQuickImportModal && (
            <button
              type="button"
              onClick={onOpenQuickImportModal}
              className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              title="Dán nhanh câu hỏi trắc nghiệm từ Word (Alkene, Hóa học...)"
            >
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden md:inline">Nhập từ Word</span>
            </button>
          )}

          {/* Reset All */}
          {totalQuestions > 0 && (
            <button
              onClick={onResetAllAnswers}
              className="p-1.5 text-slate-600 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors cursor-pointer"
              title="Làm lại từ đầu"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Score Badge */}
          <div className="flex items-center gap-1.5 bg-blue-600 text-white font-extrabold text-xs sm:text-sm px-2.5 py-1 rounded-xl shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>
              {correctCount}/{totalQuestions} đúng
            </span>
          </div>
        </div>
      </div>

      {/* Question Cards Scrollable Container */}
      <div
        className="flex-1 overflow-y-auto pr-1 my-2 space-y-3 transition-all min-h-0"
        style={{ fontSize: `${zoomLevel}%` }}
      >
        {totalQuestions === 0 ? (
          /* Empty Questions State */
          <div className="h-full flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-sky-200 rounded-2xl bg-sky-50/40 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600">
              <FileText className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="font-extrabold text-base text-slate-800">
                Bảng câu hỏi hiện đang để trống
              </h3>
              <p className="text-xs text-slate-500">
                Bạn có thể tự nhập câu hỏi trực tiếp hoặc dán nhanh từ Word (hỗ trợ công thức phân tử như CₙH₂ₙ, CH₄, C₂H₆, C₂H₄...) để bắt đầu trò chơi!
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {onOpenQuickImportModal && (
                <button
                  type="button"
                  onClick={onOpenQuickImportModal}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Dán đề từ Word (Alkene, Hóa học)</span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenEditorModal}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Nhập câu hỏi ngay</span>
              </button>
              <button
                type="button"
                onClick={onOpenLibraryModal}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>Thư viện đề thi</span>
              </button>
            </div>
          </div>
        ) : (
          quiz.questions.map((question) => {
            const currentAnswer = answers[question.id];
            const hasAnswered = !!currentAnswer;
            const isCorrect = currentAnswer?.isCorrect;

            return (
              <div
                key={question.id}
                onMouseEnter={() => onHoverCipher && onHoverCipher(question.cipherLetter)}
                onMouseLeave={() => onHoverCipher && onHoverCipher(null)}
                className={`p-3 rounded-xl border transition-all ${
                  isCorrect
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : hasAnswered
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-slate-200 bg-white hover:border-sky-300'
                }`}
              >
                {/* Question header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-extrabold text-gray-900 text-xs sm:text-sm leading-snug">
                    <span className="text-sky-700 mr-1 font-black">Câu {question.order}.</span>
                    {question.questionText}
                  </div>

                  {/* Cipher code badge */}
                  <div
                    className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border shadow-2xs"
                    style={{
                      backgroundColor: isCorrect ? question.cipherColorHex : '#f8fafc',
                      color: isCorrect ? '#ffffff' : '#475569',
                      borderColor: isCorrect ? 'transparent' : '#cbd5e1',
                    }}
                    title={`Mật mã: ${question.cipherLetter} (${question.cipherColorName})`}
                  >
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: question.cipherColorHex }}
                    />
                    <span>Ký tự: {question.cipherLetter}</span>
                  </div>
                </div>

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {question.options.map((option, optIdx) => {
                    const isSelected = currentAnswer?.selectedIndex === optIdx;
                    const isCorrectOption = question.correctOptionIndex === optIdx;

                    let btnStyle =
                      'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300';
                    let badgeStyle = 'bg-amber-100 text-amber-900 border-amber-300';

                    if (hasAnswered) {
                      if (isCorrect && isCorrectOption) {
                        btnStyle = 'bg-emerald-600 border-emerald-700 text-white shadow-xs';
                        badgeStyle = 'bg-emerald-800 text-white border-emerald-900';
                      } else if (isSelected && !isCorrect) {
                        btnStyle = 'bg-rose-500 border-rose-600 text-white animate-shake';
                        badgeStyle = 'bg-rose-700 text-white border-rose-800';
                      } else if (!isCorrect && isCorrectOption && currentAnswer?.selectedIndex !== -1) {
                        btnStyle = 'bg-white border-dashed border-emerald-400 text-emerald-700 opacity-90';
                      }
                    }

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => onSelectOption(question.id, optIdx)}
                        className={`flex items-center gap-2 p-1.5 sm:p-2 rounded-xl border font-semibold text-xs text-left transition-all ${btnStyle}`}
                      >
                        <span
                          className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center font-black text-[11px] border ${badgeStyle}`}
                        >
                          {option.cipherLetter || String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1 leading-snug">{option.text}</span>
                        {hasAnswered && isCorrect && isCorrectOption && (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-200" />
                        )}
                        {hasAnswered && isSelected && !isCorrect && (
                          <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-200" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Action Buttons at bottom pinned without spilling */}
      <div className="pt-2 border-t border-sky-100 flex flex-col gap-1.5 shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Retry Wrong Button */}
          <button
            type="button"
            onClick={onResetWrongAnswers}
            disabled={wrongCount === 0}
            className={`py-1.5 px-3 rounded-xl font-black text-xs uppercase tracking-wide transition-all shadow-xs flex items-center justify-center gap-1.5 ${
              wrongCount > 0
                ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer active:scale-98'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm lại câu sai {wrongCount > 0 ? `(${wrongCount})` : ''}</span>
          </button>

          {/* Export Word Button */}
          <button
            type="button"
            onClick={onOpenExportModal}
            className="py-1.5 px-3 rounded-xl font-black text-xs uppercase tracking-wide bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Xuất file Word</span>
          </button>

          {/* Library Button */}
          <button
            type="button"
            onClick={onOpenLibraryModal}
            className="col-span-2 sm:col-span-1 py-1.5 px-3 rounded-xl font-black text-xs uppercase tracking-wide bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Thư viện đề</span>
          </button>
        </div>

        {/* Live Notification Bar */}
        {lastFeedback ? (
          <div
            className={`text-center py-1 px-2.5 rounded-lg text-xs font-bold transition-all ${
              lastFeedback.type === 'success'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : lastFeedback.type === 'error'
                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                : 'bg-blue-100 text-blue-800 border border-blue-300'
            }`}
          >
            {lastFeedback.message}
          </div>
        ) : (
          <div className="text-center py-1 px-2.5 rounded-lg text-[11px] font-medium text-slate-500 bg-slate-50">
            {totalQuestions > 0
              ? 'Chọn đáp án đúng của từng câu để tô màu các ô chữ cái tương ứng trên ma trận!'
              : 'Hãy nhấp nút "Sửa đề" trên thanh công cụ để bắt đầu tạo câu hỏi.'}
          </div>
        )}
      </div>
    </div>
  );
};
