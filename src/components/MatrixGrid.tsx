import React, { useRef, useState, useEffect, useMemo } from 'react';
import { QuizData, StudentInfo } from '../types';
import { ensureAllQuestionsInMatrix } from '../utils/pixelText';

interface MatrixGridProps {
  quiz: QuizData;
  studentInfo: StudentInfo;
  onUpdateStudentInfo: (info: Partial<StudentInfo>) => void;
  unlockedLetters: Set<string>;
  unlockedQuestionOrders?: Set<number>;
  highlightLetter?: string | null;
  onSelectCipher?: (letter: string) => void;
  onOpenMatrixDesigner?: () => void;
  readOnly?: boolean;
  isAllAnswered?: boolean;
}

export const MatrixGrid: React.FC<MatrixGridProps> = ({
  quiz,
  studentInfo,
  onUpdateStudentInfo,
  unlockedLetters,
  unlockedQuestionOrders = new Set(),
  highlightLetter,
  onSelectCipher,
  onOpenMatrixDesigner,
  readOnly = false,
  isAllAnswered,
}) => {
  const { matrix, secretMessage, questions } = quiz;

  const showSecretMessage =
    isAllAnswered !== undefined
      ? isAllAnswered
      : questions.length === 0 ||
        questions.every(
          (q) => unlockedLetters.has(q.cipherLetter) || unlockedQuestionOrders.has(q.order)
        );

  // Guarantee that ALL questions and their cipher letters exist and are displayed in the matrix!
  const safeMatrix = useMemo(() => {
    return ensureAllQuestionsInMatrix(matrix, questions);
  }, [matrix, questions]);

  const rows = safeMatrix.rows || safeMatrix.grid.length || 16;
  const cols = safeMatrix.cols || safeMatrix.grid[0]?.length || 16;
  const cipherColors = safeMatrix.cipherColors || {};

  // Responsive container measurement for automatic pixel-perfect matrix cell sizing
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { width: availW, height: availH } = containerDimensions;

  // Dynamic font size directly proportioned to the cell dimension
  const cellW = availW > 0 ? (availW - 16) / cols : 24;
  const cellH = availH > 0 ? (availH - 16) / rows : 24;
  const cellMinDim = Math.min(cellW, cellH);
  const cellFontSize = Math.max(8, Math.min(22, Math.floor(cellMinDim * 0.58)));

  const cellGapClass =
    cols > 24 || rows > 22
      ? 'gap-[1px]'
      : cols > 18 || rows > 16
      ? 'gap-[1.5px]'
      : 'gap-[2px] sm:gap-[2.5px]';

  // Find which cipher letters are associated with questions
  const questionCiphers = questions.map((q) => ({
    letter: q.cipherLetter,
    colorName: q.cipherColorName,
    hex: q.cipherColorHex,
    isUnlocked: unlockedLetters.has(q.cipherLetter) || unlockedQuestionOrders.has(q.order),
    questionOrder: q.order,
  }));

  return (
    <div
      id="printable-matrix-card"
      className="bg-white rounded-2xl shadow-md border-2 border-amber-300 p-2.5 sm:p-3.5 flex flex-col h-full max-h-full justify-between select-none overflow-hidden"
    >
      <div className="shrink-0">
        {/* Title Header */}
        <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-wide text-rose-600 uppercase font-sans drop-shadow-xs">
              GIẢI MÃ SẮC MÀU
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenMatrixDesigner && (
              <button
                type="button"
                onClick={onOpenMatrixDesigner}
                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[11px] rounded-lg shadow-xs transition-transform active:scale-95 flex items-center gap-1 cursor-pointer"
                title="Tạo / Thiết kế bảng ma trận tô màu"
              >
                <span>🎨</span>
                <span>Tạo ma trận</span>
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold">Tô theo đáp án</span>
            </div>
          </div>
        </div>

        {/* Student Info Inputs (Họ và tên, Lớp - left blank for entry, NO author branding) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-1.5 sm:my-2">
          <div className="flex items-center bg-pink-50/70 border border-pink-200 rounded-xl px-2.5 py-1 focus-within:ring-2 focus-within:ring-pink-400 focus-within:bg-white transition-all">
            <span className="text-pink-600 font-bold text-xs shrink-0 mr-1.5 flex items-center gap-1">
              <span>🌸</span> Họ và tên:
            </span>
            <input
              type="text"
              value={studentInfo.name}
              onChange={(e) => onUpdateStudentInfo({ name: e.target.value })}
              placeholder="Nhập họ và tên..."
              disabled={readOnly}
              className="w-full bg-transparent text-xs font-bold text-gray-800 placeholder-gray-400 outline-none"
            />
          </div>

          <div className="flex items-center bg-amber-50/70 border border-amber-200 rounded-xl px-2.5 py-1 focus-within:ring-2 focus-within:ring-amber-400 focus-within:bg-white transition-all">
            <span className="text-amber-700 font-bold text-xs shrink-0 mr-1.5 flex items-center gap-1">
              <span>⭐</span> Lớp:
            </span>
            <input
              type="text"
              value={studentInfo.studentClass}
              onChange={(e) => onUpdateStudentInfo({ studentClass: e.target.value })}
              placeholder="Nhập lớp (VD: 12A1)..."
              disabled={readOnly}
              className="w-full bg-transparent text-xs font-bold text-gray-800 placeholder-gray-400 outline-none"
            />
          </div>
        </div>

        {/* Secret Message Banner - Appears after answering all questions */}
        {showSecretMessage && (
          <div className="flex items-center bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/80 rounded-xl px-3 py-1 mb-1.5 animate-in fade-in zoom-in-95 duration-500 shadow-xs">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider shrink-0 mr-2">
              Thông điệp:
            </span>
            <div className="flex-1 text-center font-extrabold text-sm sm:text-base text-rose-600 tracking-widest font-sans truncate">
              {secretMessage || 'CHƯA ĐẶT THÔNG ĐIỆP BÍ MẬT'}
            </div>
          </div>
        )}

        {/* Matrix Subtitle */}
        <div className="text-center mb-1">
          <span className="text-[10px] sm:text-[11px] font-bold text-teal-700 tracking-wider uppercase bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200 inline-block">
            Bảng mật mã ({rows}×{cols}) - Tô màu theo đáp án đúng
          </span>
        </div>
      </div>

      {/* Matrix Grid Canvas / Tiles - Spans full width of the available frame and adapts dynamically */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 w-full p-1 sm:p-1.5 bg-amber-50/50 rounded-xl border border-amber-200/80 overflow-hidden flex items-stretch justify-stretch"
      >
        <div
          className={`grid ${cellGapClass} p-1 sm:p-1.5 bg-white rounded-xl shadow-inner w-full h-full overflow-hidden`}
          style={{
            width: '100%',
            height: '100%',
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          }}
        >
          {safeMatrix.grid.slice(0, rows).map((row, rIdx) =>
            row.slice(0, cols).map((cellLetter, cIdx) => {
              const letter = (cellLetter || '').toUpperCase();
              const cellQOrder = safeMatrix.cellQuestionOrders?.[rIdx]?.[cIdx];

              let isColored = false;
              let hexColor: string | undefined = undefined;
              const linkedQuestion = cellQOrder ? questions.find((q) => q.order === cellQOrder) : undefined;

              if (cellQOrder && linkedQuestion) {
                isColored = unlockedQuestionOrders.has(cellQOrder);
                hexColor = linkedQuestion.cipherColorHex;
              } else {
                // Fallback check: does letter match any question's cipher letter?
                const matchingQ = questions.find((q) => q.cipherLetter.toUpperCase() === letter);
                if (matchingQ) {
                  isColored = unlockedLetters.has(letter);
                  hexColor = matchingQ.cipherColorHex;
                } else {
                  isColored = unlockedLetters.has(letter);
                  const colorConfig = cipherColors[letter];
                  if (colorConfig) {
                    hexColor = colorConfig.hex;
                  }
                }
              }

              const isHighlighted =
                highlightLetter === letter || (linkedQuestion && highlightLetter === linkedQuestion.cipherLetter);

              const style: React.CSSProperties =
                isColored && hexColor
                  ? {
                      backgroundColor: hexColor,
                      color: '#ffffff',
                      borderColor: 'rgba(0,0,0,0.15)',
                      boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4)',
                    }
                  : {};

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => onSelectCipher && onSelectCipher(linkedQuestion ? linkedQuestion.cipherLetter : letter)}
                  className={`
                    w-full h-full min-h-0 min-w-0 flex items-center justify-center font-black rounded-[2px] sm:rounded-xs
                    transition-all duration-150 cursor-pointer select-none
                    ${
                      isColored
                        ? 'scale-100 font-extrabold shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border border-slate-200/80 hover:bg-slate-100'
                    }
                    ${isHighlighted ? 'ring-2 ring-blue-500 scale-105 z-10' : ''}
                  `}
                  style={{
                    fontSize: `${cellFontSize}px`,
                    lineHeight: 1,
                    ...style,
                  }}
                  title={`Ký tự: ${letter}${linkedQuestion ? ` (Câu ${linkedQuestion.order}: ${linkedQuestion.cipherColorName})` : ''}`}
                >
                  {letter}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Cipher Legend (Bottom Bar) */}
      <div className="mt-1.5 pt-1 sm:pt-1.5 border-t border-amber-200/70 shrink-0">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px] sm:text-[11px] font-bold text-gray-700 max-h-14 overflow-y-auto">
          {questionCiphers.length > 0 ? (
            questionCiphers.map((item, idx) => {
              const isTargetHighlight = highlightLetter === item.letter;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectCipher && onSelectCipher(item.letter)}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                    isTargetHighlight ? 'bg-amber-100 ring-1 ring-amber-400' : 'hover:bg-slate-100'
                  } ${item.isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}
                >
                  <span
                    className="w-2 h-2 rounded-full inline-block shrink-0 shadow-2xs"
                    style={{ backgroundColor: item.hex }}
                  />
                  <span className={item.isUnlocked ? 'font-black' : 'font-medium'}>
                    {item.letter}-{item.colorName}
                  </span>
                  {item.isUnlocked && <span className="text-[9px] text-emerald-600">✓</span>}
                </button>
              );
            })
          ) : (
            <span className="text-slate-400 text-xs italic">
              Chưa có câu hỏi nào. Hãy nhấp "Sửa đề" để thêm câu hỏi và mật mã!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
