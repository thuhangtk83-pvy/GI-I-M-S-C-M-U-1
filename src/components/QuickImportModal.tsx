import React, { useState } from 'react';
import { X, FileText, Check, AlertCircle, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';
import { Question, PRESET_COLORS } from '../types';

interface QuickImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (questions: Question[], quizTitle?: string, saveToLibrary?: boolean) => void;
  initialTitle?: string;
}

export const SAMPLE_ALKENE_TEXT = `Câu 1: Công thức phân tử chung của alkene mạch hở có một liên kết đôi C=C là
A. CₙH₂ₙ₊₂ (n ≥ 1)
B. CₙH₂ₙ (n ≥ 2)
C. CₙH₂ₙ₋₂ (n ≥ 2)
D. CₙH₂ₙ₊₁OH (n ≥ 1)
Đáp án: B

Câu 2: Chất nào sau đây là alkene?
A. CH₄
B. C₂H₄
C. C₂H₆
D. C₃H₈
Đáp án: B`;

export const SAMPLE_PROTEIN_TEXT = `Câu 1: Phân tử ethylene (ethene) có công thức phân tử là
A. CH₄
B. C₂H₆
C. C₂H₄
D. C₂H₂
Đáp án: C

Câu 2: Thuốc thử dùng để nhận biết dung dịch protein (lòng trắng trứng) là
A. Cu(OH)₂ / OH⁻
B. Dung dịch I₂
C. Quỳ tím
D. AgNO₃ / NH₃
Đáp án: A`;

const CIPHER_LETTERS = ['T', 'R', 'I', 'A', 'N', 'H', 'Y', 'C', 'O', 'B', 'M', 'K', 'S', 'P', 'V', 'G', 'D', 'E', 'L', 'W'];

export const QuickImportModal: React.FC<QuickImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  initialTitle = 'BÀI TẬP VỀ ALKENE',
}) => {
  const [quizTitle, setQuizTitle] = useState(initialTitle);
  const [rawText, setRawText] = useState(SAMPLE_ALKENE_TEXT);
  const [errorMsg, setErrorMsg] = useState('');
  const [parsedPreview, setParsedPreview] = useState<Question[] | null>(null);

  if (!isOpen) return null;

  // Robust parser for Vietnamese multiple-choice question formats
  const parseQuestions = (text: string): Question[] => {
    const trimmed = text.trim();
    if (!trimmed) return [];

    // Split questions by "Câu 1:", "Câu 1.", "Câu 1", "Bài 1:", "1.", "1:"
    const rawBlocks = trimmed
      .split(/(?:^|\n+)(?=(?:Câu|Bài|CÂU|BÀI)\s*\d+[\s:.\-–—]|\b\d+[\s:.\)\/\-–—]\s*(?=[A-ZÀ-Ỹ0-9]))/gi)
      .filter((b) => b.trim().length > 0);

    if (rawBlocks.length === 0) return [];

    const result: Question[] = [];

    rawBlocks.forEach((block, index) => {
      const lines = block
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length < 2) return;

      let questionText = lines[0];
      // Strip leading "Câu 1:", "1.", "Bài 1:" etc.
      questionText = questionText.replace(/^(?:(?:Câu|Bài|CÂU|BÀI)\s*\d+[:.\-–—]?|\d+[:.\)\/\-–—]?)\s*/i, '').trim();

      // Strip any [Ký tự -màu] trailing tags
      questionText = questionText.replace(/\[\s*Ký\s*tự(?:\s*mật\s*mã)?\s*[:\-–—]?\s*(?:màu\s*)?[^\]]*\]/gi, '');
      questionText = questionText.replace(/\s*\[\s*(?:Ký\s*tự\s*[:\-–—]?\s*)?[A-Za-z0-9\s]*[-–—:]\s*(?:màu\s*)?[^\]]+\]\s*$/gi, '').trim();

      const options: { letter: string; text: string }[] = [];
      let correctIndex = 0;
      let foundAnswerLine = false;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];

        // Match answer line: "Đáp án: B", "Đáp án: B.", "Đáp án B", "Đ/A: B", "Key: B", "Chọn B"
        const matchAns = line.match(/(?:Đáp\s*án(?:\s*đúng)?|Đ\/A|ĐA|Answer|Key|Chọn)[:\s]*[\[\(]?\s*([A-Da-d])\s*[\]\.]?/i);
        if (matchAns) {
          const letter = matchAns[1].toUpperCase();
          correctIndex = letter.charCodeAt(0) - 65;
          foundAnswerLine = true;
          continue;
        }

        // Match option line: "A. CₙH₂ₙ₊₂ (n ≥ 1)", "A) CH₄", "*B. C₂H₄"
        const matchOpt = line.match(/^[*]?\s*([A-Da-d])[\.:\)\s]\s*(.+)/);
        if (matchOpt) {
          const optLetter = matchOpt[1].toUpperCase();
          let optText = matchOpt[2].trim();
          // Clean trailing [Ký tự -màu] from options if any
          optText = optText.replace(/\[\s*Ký\s*tự[^\]]*\]/gi, '').trim();

          options.push({
            letter: optLetter,
            text: optText,
          });

          // Check if asterisk was used for correct option (e.g. *B. ...)
          if (line.trim().startsWith('*') && !foundAnswerLine) {
            correctIndex = optLetter.charCodeAt(0) - 65;
          }
        } else if (options.length === 0) {
          // Multiline question statement before options
          questionText += ' ' + line;
        }
      }

      // If options were inline (e.g. A. ... B. ... C. ... D. ...)
      if (options.length < 2) {
        const inlineRegex = /(?:^|\s+)([A-Da-d])[\.:\)\s]\s*([^\n\r]*?)(?=(?:\s+[A-Da-d][\.:\)\s]|$))/g;
        let match;
        const found: { letter: string; text: string }[] = [];
        while ((match = inlineRegex.exec(block)) !== null) {
          if (match[2].trim()) {
            found.push({
              letter: match[1].toUpperCase(),
              text: match[2].trim().replace(/\[\s*Ký\s*tự[^\]]*\]/gi, '').trim(),
            });
          }
        }
        if (found.length >= 2) {
          options.length = 0;
          options.push(...found);
        }
      }

      // Fallback 4 options if none found
      if (options.length === 0) {
        options.push(
          { letter: 'A', text: 'Phương án A' },
          { letter: 'B', text: 'Phương án B' },
          { letter: 'C', text: 'Phương án C' },
          { letter: 'D', text: 'Phương án D' }
        );
      }

      const cipherLetter = CIPHER_LETTERS[index % CIPHER_LETTERS.length];
      const colorObj = PRESET_COLORS[index % PRESET_COLORS.length];
      const validCorrectIdx = Math.min(Math.max(0, correctIndex), options.length - 1);

      result.push({
        id: `imported-${Date.now()}-${index + 1}`,
        order: index + 1,
        questionText,
        cipherLetter,
        cipherColorName: colorObj.name,
        cipherColorHex: colorObj.hex,
        correctOptionIndex: validCorrectIdx,
        options: options.map((opt, oIdx) => ({
          id: `opt-${index}-${oIdx}`,
          cipherLetter:
            oIdx === validCorrectIdx
              ? cipherLetter
              : String.fromCharCode(65 + ((cipherLetter.charCodeAt(0) - 65 + oIdx + 1) % 26)),
          text: opt.text,
        })),
      });
    });

    return result;
  };

  const handleExecuteImport = (saveToLibrary: boolean) => {
    setErrorMsg('');
    const parsed = parseQuestions(rawText);

    if (parsed.length === 0) {
      setErrorMsg('Không tìm thấy câu hỏi nào hợp lệ. Vui lòng kiểm tra lại định dạng câu hỏi và đáp án.');
      return;
    }

    const titleToUse = quizTitle.trim() || 'Bộ câu hỏi trắc nghiệm mới';
    onImport(parsed, titleToUse, saveToLibrary);
    onClose();
  };

  const currentQuestions = parseQuestions(rawText);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[92vh] overflow-hidden border-2 border-blue-300 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 p-4 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl">Chuyển đổi câu hỏi vào đề thi</h3>
              <p className="text-xs text-sky-100">
                Tự động nhận diện công thức hóa học, chỉ số dưới (CₙH₂ₙ, C₂H₄...) và đáp án đúng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-slate-50/60">
          {/* Quiz Title Input */}
          <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-2xs space-y-1">
            <label className="text-xs font-black uppercase text-blue-900 tracking-wider">
              Tên chủ đề / Bộ đề khi lưu:
            </label>
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="VD: HÓA HỌC 11 - BÀI TẬP VỀ ALKENE..."
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold text-slate-800 uppercase focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Format Guide and Sample Buttons */}
          <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl text-xs text-sky-950 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-sky-900">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Định dạng mẫu được hỗ trợ:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setRawText(SAMPLE_ALKENE_TEXT)}
                  className="px-2 py-0.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-[11px] rounded-md transition-colors cursor-pointer"
                >
                  ⚡ Mẫu Alkene (CₙH₂ₙ, C₂H₄)
                </button>
                <button
                  type="button"
                  onClick={() => setRawText(SAMPLE_PROTEIN_TEXT)}
                  className="px-2 py-0.5 bg-white hover:bg-sky-100 text-sky-700 border border-sky-300 font-bold text-[11px] rounded-md transition-colors cursor-pointer"
                >
                  🧪 Mẫu Protein
                </button>
              </div>
            </div>

            <pre className="font-mono text-[11px] bg-white p-2 rounded-lg border border-sky-200 text-slate-800 overflow-x-auto leading-relaxed">
{`Câu 1: Công thức phân tử chung của alkene mạch hở có một liên kết đôi C=C là
A. CₙH₂ₙ₊₂ (n ≥ 1)
B. CₙH₂ₙ (n ≥ 2)
C. CₙH₂ₙ₋₂ (n ≥ 2)
D. CₙH₂ₙ₊₁OH (n ≥ 1)
Đáp án: B`}
            </pre>
          </div>

          {/* Text Area Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Nội dung câu hỏi dán vào:</span>
              <span className="text-blue-600 font-extrabold">
                {currentQuestions.length > 0 ? (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Tìm thấy {currentQuestions.length} câu hỏi hợp lệ
                  </span>
                ) : (
                  <span className="text-slate-400">Chưa có câu hỏi hợp lệ</span>
                )}
              </span>
            </div>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={9}
              className="w-full p-3 font-mono text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-800 shadow-inner leading-relaxed"
              placeholder="Dán câu hỏi vào đây theo định dạng: Câu 1: ... A. ... B. ... C. ... D. ... Đáp án: B"
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer with both Save to Current Quiz & Save to Library */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl border border-slate-300 font-bold text-xs sm:text-sm text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Hủy
          </button>

          <div className="flex items-center gap-2">
            {/* Button 1: Save as New Quiz into Library */}
            <button
              type="button"
              onClick={() => handleExecuteImport(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              title="Lưu bộ câu hỏi này thành đề mới trong thư viện đề"
            >
              <BookOpen className="w-4 h-4" />
              <span>Chuyển đổi & Lưu vào THƯ VIỆN</span>
            </button>

            {/* Button 2: Import into Current Quiz */}
            <button
              type="button"
              onClick={() => handleExecuteImport(false)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              title="Cập nhật trực tiếp các câu hỏi này vào đề đang làm"
            >
              <Check className="w-4 h-4" />
              <span>Lưu vào đề hiện tại</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
