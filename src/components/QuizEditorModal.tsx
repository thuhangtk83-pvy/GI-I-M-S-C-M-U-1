import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  FileText,
  Grid,
  Check,
  RotateCcw,
  Palette,
} from 'lucide-react';
import { QuizData, Question, PRESET_COLORS, MatrixGridConfig } from '../types';
import { QuickImportModal } from './QuickImportModal';
import { MatrixDesignerModal } from './MatrixDesignerModal';
import { saveQuizToStorage } from './LibraryModal';

interface QuizEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizData;
  onSaveQuiz: (updatedQuiz: QuizData) => void;
}

const SUBJECT_OPTIONS = [
  'Hóa học',
  'Sinh học',
  'Toán học',
  'Vật lý',
  'Tiếng Anh',
  'Lịch sử',
  'Địa lí',
  'Ngữ văn',
  'Tin học',
  'Công nghệ',
  'GDCD',
  'Tiểu học',
];

const GRADE_OPTIONS = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);

export const QuizEditorModal: React.FC<QuizEditorModalProps> = ({
  isOpen,
  onClose,
  quiz,
  onSaveQuiz,
}) => {
  const [title, setTitle] = useState(quiz.title);
  const [subject, setSubject] = useState(quiz.subject);
  const [grade, setGrade] = useState(quiz.grade);
  const [secretMessage, setSecretMessage] = useState(quiz.secretMessage);
  const [questions, setQuestions] = useState<Question[]>(() =>
    quiz.questions.map((q) => ({
      ...q,
      options: q.options.map((o) => ({ ...o })),
    }))
  );
  const [matrix, setMatrix] = useState<MatrixGridConfig>(quiz.matrix);

  // Sub-modals
  const [isWordImportOpen, setIsWordImportOpen] = useState(false);
  const [isMatrixDesignerOpen, setIsMatrixDesignerOpen] = useState(false);

  // Active color picker state: { questionIndex: number } | null
  const [editingCipherQuestionIdx, setEditingCipherQuestionIdx] = useState<number | null>(null);

  // Re-sync whenever quiz prop changes or modal opens
  React.useEffect(() => {
    setTitle(quiz.title);
    setSubject(quiz.subject);
    setGrade(quiz.grade);
    setSecretMessage(quiz.secretMessage);
    setQuestions(
      quiz.questions.map((q) => ({
        ...q,
        options: q.options.map((o) => ({ ...o })),
      }))
    );
    setMatrix(quiz.matrix);
  }, [quiz, isOpen]);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    const nextOrder = questions.length + 1;
    const defaultColor = PRESET_COLORS[(nextOrder - 1) % PRESET_COLORS.length];
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nextCipher = letters[(nextOrder - 1) % letters.length];

    const newQ: Question = {
      id: `q-${Date.now()}-${nextOrder}`,
      order: nextOrder,
      questionText: '',
      cipherLetter: nextCipher,
      cipherColorName: defaultColor.name,
      cipherColorHex: defaultColor.hex,
      correctOptionIndex: 0,
      options: [
        { id: `opt-0`, cipherLetter: nextCipher, text: '' },
        { id: `opt-1`, cipherLetter: 'B', text: '' },
        { id: `opt-2`, cipherLetter: 'C', text: '' },
        { id: `opt-3`, cipherLetter: 'D', text: '' },
      ],
    };
    setQuestions([...questions, newQ]);
  };

  const handleDeleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    // Re-index orders
    const reordered = updated.map((q, idx) => ({
      ...q,
      order: idx + 1,
    }));
    setQuestions(reordered);
  };

  const handleUpdateQuestion = (index: number, fields: Partial<Question>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...fields };
    setQuestions(updated);
  };

  const handleUpdateOption = (qIdx: number, optIdx: number, text: string) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx].text = text;
    setQuestions(updated);
  };

  const handleSelectCorrectOption = (qIdx: number, optIdx: number) => {
    const updated = [...questions];
    updated[qIdx].correctOptionIndex = optIdx;
    // ensure the cipher letter is attached to the correct option
    updated[qIdx].options.forEach((opt, idx) => {
      if (idx === optIdx) {
        opt.cipherLetter = updated[qIdx].cipherLetter;
      }
    });
    setQuestions(updated);
  };

  const handleResetBlank = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ và làm mới trắng không?')) {
      setTitle('');
      setSecretMessage('');
      setQuestions([]);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Vui lòng nhập tên chủ đề hoặc bài học!');
      return;
    }
    if (questions.length === 0) {
      alert('Vui lòng thêm ít nhất 1 câu hỏi!');
      return;
    }

    // Auto update matrix cipherColors to match questions
    const cipherColors = { ...matrix.cipherColors };
    questions.forEach((q) => {
      cipherColors[q.cipherLetter] = {
        name: q.cipherColorName,
        hex: q.cipherColorHex,
      };
    });

    onSaveQuiz({
      ...quiz,
      title,
      subject,
      grade,
      secretMessage: secretMessage.toUpperCase(),
      questions,
      matrix: {
        ...matrix,
        cipherColors,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full flex flex-col max-h-[94vh] overflow-hidden border border-emerald-200 animate-in fade-in zoom-in-95">
        {/* Top Header matching MTSM3.jpg */}
        <div className="bg-emerald-600 px-4 py-3 sm:px-6 sm:py-3.5 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <h2 className="font-extrabold text-lg sm:text-xl uppercase tracking-wide">
              TẠO / CHỈNH SỬA BỘ CÂU HỎI
            </h2>
            <span className="bg-emerald-700/80 text-emerald-100 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500">
              {questions.length} câu hỏi
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-emerald-700 rounded-lg transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body matching MTSM3.jpg */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 bg-slate-50/50">
          {/* Row 1: Tên chủ đề, Môn học, Lớp */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="md:col-span-6">
              <label className="block text-xs font-black uppercase text-slate-600 tracking-wider mb-1">
                Tên chủ đề/bài học (VD: KIM LOẠI KIỀM)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="NHẬP TÊN CHỦ ĐỀ/BÀI HỌC..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-black uppercase text-slate-600 tracking-wider mb-1">
                Môn học
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {SUBJECT_OPTIONS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-black uppercase text-slate-600 tracking-wider mb-1">
                Lớp
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {GRADE_OPTIONS.map((gr) => (
                  <option key={gr} value={gr}>
                    {gr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Thông điệp bí mật, Nút Word, Nút Tạo ma trận */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-end bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="md:col-span-5">
              <label className="block text-xs font-black uppercase text-amber-700 tracking-wider mb-1">
                Thông điệp bí mật (Khi hoàn thành):
              </label>
              <input
                type="text"
                value={secretMessage}
                onChange={(e) => setSecretMessage(e.target.value)}
                placeholder="VD: BIẾT ƠN THẦY CÔ"
                className="w-full px-3 py-2 bg-amber-50/50 border border-amber-300 rounded-xl text-sm font-black text-rose-600 placeholder-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none uppercase tracking-wider"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Nhập đề nhanh từ Microsoft Word:
              </label>
              <button
                type="button"
                onClick={() => setIsWordImportOpen(true)}
                className="w-full py-2 px-3 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>NHẬP TỪ FILE WORD</span>
              </button>
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Bảng mật mã & Ký tự:
              </label>
              <button
                type="button"
                onClick={() => setIsMatrixDesignerOpen(true)}
                className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Grid className="w-4 h-4" />
                <span>TẠO BẢNG MA TRẬN</span>
              </button>
            </div>
          </div>

          {/* Question List Cards matching MTSM3.jpg */}
          <div className="space-y-4">
            {questions.map((question, qIdx) => (
              <div
                key={question.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3"
              >
                {/* Question Item Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                      {qIdx + 1}
                    </span>
                    <span className="font-extrabold text-sm text-slate-800">
                      Nội dung câu hỏi {qIdx + 1}:
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Cipher badge button to change cipher letter / color */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingCipherQuestionIdx(
                            editingCipherQuestionIdx === qIdx ? null : qIdx
                          )
                        }
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs border transition-all cursor-pointer"
                        style={{
                          backgroundColor: `${question.cipherColorHex}15`,
                          color: question.cipherColorHex,
                          borderColor: question.cipherColorHex,
                        }}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: question.cipherColorHex }}
                        />
                        <span>
                          Ký tự mật mã: {question.cipherLetter} ({question.cipherColorName})
                        </span>
                        <Palette className="w-3 h-3 ml-0.5 opacity-70" />
                      </button>

                      {/* Dropdown Color & Letter Picker */}
                      {editingCipherQuestionIdx === qIdx && (
                        <div className="absolute right-0 top-full mt-1.5 p-3 bg-white rounded-xl shadow-xl border border-slate-200 z-30 w-64 space-y-2">
                          <div>
                            <label className="text-[11px] font-bold text-slate-500 block mb-1">
                              Chọn ký tự hiển thị trên ma trận:
                            </label>
                            <input
                              type="text"
                              maxLength={2}
                              value={question.cipherLetter}
                              onChange={(e) => {
                                const val = e.target.value.toUpperCase();
                                handleUpdateQuestion(qIdx, { cipherLetter: val });
                              }}
                              className="w-16 px-2 py-1 text-center font-black text-sm border rounded uppercase"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-500 block mb-1">
                              Chọn màu tô:
                            </label>
                            <div className="grid grid-cols-5 gap-1.5">
                              {PRESET_COLORS.map((col) => (
                                <button
                                  key={col.hex}
                                  type="button"
                                  onClick={() => {
                                    handleUpdateQuestion(qIdx, {
                                      cipherColorName: col.name,
                                      cipherColorHex: col.hex,
                                    });
                                    setEditingCipherQuestionIdx(null);
                                  }}
                                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                                  style={{
                                    backgroundColor: col.hex,
                                    borderColor:
                                      question.cipherColorHex === col.hex
                                        ? '#000000'
                                        : 'transparent',
                                  }}
                                  title={col.name}
                                >
                                  {question.cipherColorHex === col.hex && (
                                    <Check className="w-3.5 h-3.5 text-white" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Delete Question Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(qIdx)}
                      className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800 p-1 rounded-md hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa câu này</span>
                    </button>
                  </div>
                </div>

                {/* Question Textarea */}
                <textarea
                  rows={2}
                  value={question.questionText}
                  onChange={(e) => handleUpdateQuestion(qIdx, { questionText: e.target.value })}
                  placeholder="Nhập nội dung câu hỏi..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {question.options.map((opt, optIdx) => {
                    const isCorrect = question.correctOptionIndex === optIdx;
                    return (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-2 p-1.5 px-2.5 rounded-xl border transition-all ${
                          isCorrect
                            ? 'border-emerald-400 bg-emerald-50/40 ring-1 ring-emerald-400'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        {/* Radio select for correct answer */}
                        <input
                          type="radio"
                          name={`correct-opt-${question.id}`}
                          checked={isCorrect}
                          onChange={() => handleSelectCorrectOption(qIdx, optIdx)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          title="Chọn làm đáp án đúng"
                        />
                        <span className="text-xs font-black text-slate-500 shrink-0">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                          placeholder={`Đáp án ${optIdx + 1}...`}
                          className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-800 outline-none placeholder-slate-400"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions matching MTSM3.jpg */}
        <div className="p-3 sm:p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAddQuestion}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm câu hỏi</span>
            </button>

            <button
              type="button"
              onClick={() => setIsWordImportOpen(true)}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Nhập từ Word</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMatrixDesignerOpen(true)}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Grid className="w-4 h-4 text-purple-600" />
              <span>Tạo bảng ma trận</span>
            </button>

            <button
              type="button"
              onClick={handleResetBlank}
              className="px-3 py-2 text-slate-500 hover:text-slate-800 font-semibold text-xs rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm mới trắng</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-xs sm:text-sm text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>LƯU VÀO THƯ VIỆN & ÁP DỤNG</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub Modals */}
      <QuickImportModal
        isOpen={isWordImportOpen}
        onClose={() => setIsWordImportOpen(false)}
        onImport={(importedQuestions, customTitle, saveToLibrary) => {
          if (customTitle && (!title || title.trim() === '')) {
            setTitle(customTitle);
          }
          const updatedQuestions = questions.length === 0 ? importedQuestions : [...questions, ...importedQuestions];
          setQuestions(updatedQuestions);

          if (saveToLibrary) {
            const cipherColors = { ...matrix.cipherColors };
            updatedQuestions.forEach((q) => {
              cipherColors[q.cipherLetter] = {
                name: q.cipherColorName,
                hex: q.cipherColorHex,
              };
            });

            const quizToSave: QuizData = {
              ...quiz,
              id: `quiz-${Date.now()}`,
              title: customTitle || title || 'Bộ đề mới',
              subject,
              grade,
              secretMessage: secretMessage.toUpperCase(),
              questions: updatedQuestions,
              matrix: {
                ...matrix,
                cipherColors,
              },
            };
            saveQuizToStorage(quizToSave);
            onSaveQuiz(quizToSave);
            alert(`Đã lưu thành công bộ đề "${quizToSave.title}" vào thư viện!`);
          }
        }}
        initialTitle={title || 'BÀI TẬP VỀ ALKENE'}
      />

      <MatrixDesignerModal
        isOpen={isMatrixDesignerOpen}
        onClose={() => setIsMatrixDesignerOpen(false)}
        questions={questions}
        currentMatrix={matrix}
        secretMessage={secretMessage}
        onSaveMatrix={(newMatrix, newQuestions) => {
          setMatrix(newMatrix);
          if (newQuestions && newQuestions.length > 0 && questions.length === 0) {
            setQuestions(newQuestions);
          }
        }}
      />
    </div>
  );
};
