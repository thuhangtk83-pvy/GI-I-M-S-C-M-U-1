import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Grid,
  Sparkles,
  RefreshCw,
  Paintbrush,
  Eye,
  EyeOff,
  Trash2,
  Type,
  Maximize2,
  HelpCircle,
} from 'lucide-react';
import { MatrixGridConfig, Question, PRESET_COLORS } from '../types';
import {
  generate2LineTextMatrix,
  removeVietnameseAccents,
  calculateOptimalMatrixSize,
  ensureAllQuestionsInMatrix,
  QuestionCipherRef,
} from '../utils/pixelText';

interface MatrixDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  currentMatrix: MatrixGridConfig;
  secretMessage?: string;
  onSaveMatrix: (matrix: MatrixGridConfig, newQuestions?: Question[]) => void;
}

const FILLER_LETTERS = ['P', 'U', 'Q', 'E', 'K', 'W', 'G', 'X', 'Z', 'J', 'F', 'V', 'M', 'D', 'S', 'L'];

const DEFAULT_CIPHERS: QuestionCipherRef[] = [
  { order: 1, cipherLetter: 'T', name: 'Đỏ', hex: '#ef4444' },
  { order: 2, cipherLetter: 'R', name: 'Vàng', hex: '#eab308' },
  { order: 3, cipherLetter: 'I', name: 'Xanh lá', hex: '#22c55e' },
  { order: 4, cipherLetter: 'A', name: 'Đỏ', hex: '#ef4444' },
  { order: 5, cipherLetter: 'N', name: 'Xanh lá', hex: '#16a34a' },
  { order: 6, cipherLetter: 'H', name: 'Tím', hex: '#a855f7' },
  { order: 7, cipherLetter: 'Y', name: 'Cam', hex: '#f97316' },
  { order: 8, cipherLetter: 'C', name: 'Xanh dương', hex: '#0ea5e9' },
  { order: 9, cipherLetter: 'O', name: 'Hồng', hex: '#ec4899' },
  { order: 10, cipherLetter: 'B', name: 'Đỏ', hex: '#ef4444' },
];

export const MatrixDesignerModal: React.FC<MatrixDesignerModalProps> = ({
  isOpen,
  onClose,
  questions,
  currentMatrix,
  secretMessage = '',
  onSaveMatrix,
}) => {
  const [rows, setRows] = useState(currentMatrix?.rows || 16);
  const [cols, setCols] = useState(currentMatrix?.cols || 16);

  const [grid, setGrid] = useState<string[][]>(() => {
    if (currentMatrix?.grid && currentMatrix.grid.length > 0) {
      return currentMatrix.grid.map((r) => [...r]);
    }
    return Array.from({ length: 16 }, () =>
      Array.from({ length: 16 }, () => FILLER_LETTERS[Math.floor(Math.random() * FILLER_LETTERS.length)])
    );
  });

  const [cellQuestionOrders, setCellQuestionOrders] = useState<(number | null)[][]>(() => {
    if (currentMatrix?.cellQuestionOrders && currentMatrix.cellQuestionOrders.length > 0) {
      return currentMatrix.cellQuestionOrders.map((r) => [...r]);
    }
    return Array.from({ length: 16 }, () => Array.from({ length: 16 }, () => null));
  });

  // Calculate default 2 lines from secretMessage if available
  const getInitialLines = (msg: string) => {
    const clean = removeVietnameseAccents(msg.trim().toUpperCase());
    if (!clean) return { l1: 'BIET ON', l2: 'THAY CO' };

    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      const mid = Math.ceil(words.length / 2);
      return {
        l1: words.slice(0, mid).join(' '),
        l2: words.slice(mid).join(' '),
      };
    }
    // Single word
    if (clean.length > 5) {
      const half = Math.ceil(clean.length / 2);
      return {
        l1: clean.slice(0, half),
        l2: clean.slice(half),
      };
    }
    return { l1: clean, l2: '' };
  };

  const initialLines = getInitialLines(secretMessage);
  const [line1, setLine1] = useState(initialLines.l1);
  const [line2, setLine2] = useState(initialLines.l2);

  // Available cipher letters from questions or default palette if no questions yet
  const availableCiphers: QuestionCipherRef[] =
    questions && questions.length > 0
      ? questions.map((q) => ({
          letter: q.cipherLetter,
          cipherLetter: q.cipherLetter,
          name: q.cipherColorName,
          hex: q.cipherColorHex,
          order: q.order,
        }))
      : DEFAULT_CIPHERS;

  const [selectedLetter, setSelectedLetter] = useState<string>(
    availableCiphers[0]?.cipherLetter || 'T'
  );
  const [isPreviewComplete, setIsPreviewComplete] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [autoCreateQuestionsIfEmpty, setAutoCreateQuestionsIfEmpty] = useState(true);
  const [autoFitMatrix, setAutoFitMatrix] = useState(true);

  // Compute optimal matrix size whenever line1 or line2 changes
  const optimalSize = calculateOptimalMatrixSize(line1, line2);

  // Re-sync state whenever modal opens or matrix changes
  useEffect(() => {
    if (isOpen) {
      const lines = getInitialLines(secretMessage);
      setLine1(lines.l1);
      setLine2(lines.l2);

      // Auto compute optimal size based on secretMessage lines if starting empty or requested
      const optimal = calculateOptimalMatrixSize(lines.l1, lines.l2);
      const targetRows = currentMatrix?.rows || optimal.rows;
      const targetCols = currentMatrix?.cols || optimal.cols;

      setRows(targetRows);
      setCols(targetCols);

      if (currentMatrix?.grid && currentMatrix.grid.length > 0) {
        setGrid(currentMatrix.grid.map((r) => [...r]));
      } else {
        setGrid(
          Array.from({ length: targetRows }, () =>
            Array.from({ length: targetCols }, () => FILLER_LETTERS[Math.floor(Math.random() * FILLER_LETTERS.length)])
          )
        );
      }

      if (currentMatrix?.cellQuestionOrders && currentMatrix.cellQuestionOrders.length > 0) {
        setCellQuestionOrders(currentMatrix.cellQuestionOrders.map((r) => [...r]));
      } else {
        setCellQuestionOrders(
          Array.from({ length: targetRows }, () => Array.from({ length: targetCols }, () => null))
        );
      }

      setSelectedLetter(availableCiphers[0]?.cipherLetter || 'T');
      setIsPreviewComplete(false);
    }
  }, [isOpen, currentMatrix, secretMessage]);

  if (!isOpen) return null;

  // Handle cell click / paint
  const handleCellClick = (r: number, c: number) => {
    if (r >= rows || c >= cols) return;
    const currentCipher = availableCiphers.find((ac) => ac.cipherLetter === selectedLetter);
    const targetOrder = currentCipher ? currentCipher.order : null;

    const newGrid = grid.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === r && cIdx === c ? selectedLetter : cell))
    );
    const newOrders = cellQuestionOrders.map((row, rIdx) =>
      row.map((val, cIdx) => (rIdx === r && cIdx === c ? targetOrder : val))
    );

    setGrid(newGrid);
    setCellQuestionOrders(newOrders);
  };

  const handleCellMouseEnter = (r: number, c: number) => {
    if (!isMouseDown) return;
    handleCellClick(r, c);
  };

  // Resize matrix dimensions
  const handleResize = (newRows: number, newCols: number) => {
    const validRows = Math.max(8, Math.min(26, newRows));
    const validCols = Math.max(8, Math.min(28, newCols));

    setRows(validRows);
    setCols(validCols);

    const newGrid: string[][] = Array.from({ length: validRows }, (_, r) =>
      Array.from({ length: validCols }, (_, c) => {
        if (grid[r] && grid[r][c]) {
          return grid[r][c];
        }
        return FILLER_LETTERS[Math.floor(Math.random() * FILLER_LETTERS.length)];
      })
    );

    const newOrders: (number | null)[][] = Array.from({ length: validRows }, (_, r) =>
      Array.from({ length: validCols }, (_, c) => {
        if (cellQuestionOrders[r] && cellQuestionOrders[r][c] !== undefined) {
          return cellQuestionOrders[r][c];
        }
        return null;
      })
    );

    setGrid(newGrid);
    setCellQuestionOrders(newOrders);
  };

  // Clear previous artwork (Xóa hình cũ về chữ cái nền ngẫu nhiên)
  const handleClearArt = () => {
    if (window.confirm('Bạn có muốn xóa toàn bộ hình cũ và đặt lại các ô thành chữ cái nền ngẫu nhiên không?')) {
      const blankGrid: string[][] = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => FILLER_LETTERS[Math.floor(Math.random() * FILLER_LETTERS.length)])
      );
      const blankOrders: (number | null)[][] = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => null)
      );
      setGrid(blankGrid);
      setCellQuestionOrders(blankOrders);
    }
  };

  // Generate 2-line pixel text and distribute across questions
  const handleApply2LineText = () => {
    if (!line1.trim() && !line2.trim()) {
      alert('Vui lòng nhập ít nhất một dòng chữ.');
      return;
    }

    // Auto-adjust size to fit text perfectly
    const optimal = calculateOptimalMatrixSize(line1, line2);
    const targetCols = autoFitMatrix ? optimal.cols : cols;
    const targetRows = autoFitMatrix ? optimal.rows : rows;

    if (targetCols !== cols || targetRows !== rows) {
      setCols(targetCols);
      setRows(targetRows);
    }

    const { grid: generatedGrid, cellQuestionOrders: generatedOrders } = generate2LineTextMatrix(
      line1,
      line2,
      targetRows,
      targetCols,
      selectedLetter,
      FILLER_LETTERS,
      availableCiphers
    );

    setGrid(generatedGrid);
    setCellQuestionOrders(generatedOrders);
    setIsPreviewComplete(true); // show preview immediately so user sees the result!
  };

  // Preset Template: Heart
  const handleApplyHeart = () => {
    const newGrid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => FILLER_LETTERS[Math.floor(Math.random() * FILLER_LETTERS.length)])
    );
    const newOrders: (number | null)[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => null)
    );

    const centerR = Math.floor(rows / 2);
    const centerC = Math.floor(cols / 2);

    const heartOffsets = [
      [-3, -2], [-3, -1], [-3, 1], [-3, 2],
      [-2, -3], [-2, -2], [-2, -1], [-2, 0], [-2, 1], [-2, 2], [-2, 3],
      [-1, -3], [-1, -2], [-1, -1], [-1, 0], [-1, 1], [-1, 2], [-1, 3],
      [0, -3], [0, -2], [0, -1], [0, 0], [0, 1], [0, 2], [0, 3],
      [1, -2], [1, -1], [1, 0], [1, 1], [1, 2],
      [2, -1], [2, 0], [2, 1],
      [3, 0],
    ];

    heartOffsets.forEach(([dr, dc], idx) => {
      const r = centerR + dr;
      const c = centerC + dc;
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        const assigned = availableCiphers[idx % availableCiphers.length];
        newGrid[r][c] = assigned.cipherLetter;
        newOrders[r][c] = assigned.order;
      }
    });

    setGrid(newGrid);
    setCellQuestionOrders(newOrders);
    setIsPreviewComplete(true);
  };

  // Preset Template: Star
  const handleApplyStar = () => {
    const newGrid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => FILLER_LETTERS[Math.floor(Math.random() * FILLER_LETTERS.length)])
    );
    const newOrders: (number | null)[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => null)
    );

    const centerR = Math.floor(rows / 2);
    const centerC = Math.floor(cols / 2);

    const starOffsets = [
      [-4, 0], [-3, 0],
      [-2, -1], [-2, 0], [-2, 1],
      [-1, -4], [-1, -3], [-1, -2], [-1, -1], [-1, 0], [-1, 1], [-1, 2], [-1, 3], [-1, 4],
      [0, -2], [0, -1], [0, 0], [0, 1], [0, 2],
      [1, -1], [1, 0], [1, 1],
      [2, -2], [2, -1], [2, 0], [2, 1], [2, 2],
      [3, -3], [3, 3],
    ];

    starOffsets.forEach(([dr, dc], idx) => {
      const r = centerR + dr;
      const c = centerC + dc;
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        const assigned = availableCiphers[idx % availableCiphers.length];
        newGrid[r][c] = assigned.cipherLetter;
        newOrders[r][c] = assigned.order;
      }
    });

    setGrid(newGrid);
    setCellQuestionOrders(newOrders);
    setIsPreviewComplete(true);
  };

  const handleSave = () => {
    const cipherColors: Record<string, { name: string; hex: string }> = {};

    // Collect all colors from available ciphers
    availableCiphers.forEach((c) => {
      cipherColors[c.cipherLetter] = {
        name: c.name,
        hex: c.hex,
      };
    });

    // Also collect any cipherColors already in currentMatrix
    if (currentMatrix?.cipherColors) {
      Object.assign(cipherColors, currentMatrix.cipherColors);
    }

    const initialSavedMatrix: MatrixGridConfig = {
      rows,
      cols,
      grid: grid.slice(0, rows).map((r) => r.slice(0, cols)),
      cellQuestionOrders: cellQuestionOrders.slice(0, rows).map((r) => r.slice(0, cols)),
      cipherColors,
    };

    const savedMatrix = ensureAllQuestionsInMatrix(initialSavedMatrix, questions || []);

    // If there were NO questions in the quiz, optionally generate matching template questions
    let generatedQuestions: Question[] | undefined = undefined;
    if ((!questions || questions.length === 0) && autoCreateQuestionsIfEmpty) {
      // Find which orders were actually used in cellQuestionOrders
      const usedOrders = new Set<number>();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ord = cellQuestionOrders[r]?.[c];
          if (ord) usedOrders.add(ord);
        }
      }

      const ordersList = Array.from(usedOrders).sort((a, b) => a - b);
      const targetOrders = ordersList.length > 0 ? ordersList : [1, 2, 3, 4, 5];

      generatedQuestions = targetOrders.map((order, idx) => {
        const cipher = availableCiphers.find((ac) => ac.order === order) || availableCiphers[idx % availableCiphers.length];
        return {
          id: `q-auto-${Date.now()}-${idx + 1}`,
          order: idx + 1,
          questionText: `Câu hỏi ${idx + 1} (Nhấp vào "Sửa đề" để đổi nội dung):`,
          cipherLetter: cipher.cipherLetter,
          cipherColorName: cipher.name,
          cipherColorHex: cipher.hex,
          correctOptionIndex: 0,
          options: [
            { id: `opt-0`, cipherLetter: cipher.cipherLetter, text: 'Đáp án chính xác (Mở khóa chữ trên ma trận)' },
            { id: `opt-1`, cipherLetter: 'B', text: 'Phương án B' },
            { id: `opt-2`, cipherLetter: 'C', text: 'Phương án C' },
            { id: `opt-3`, cipherLetter: 'D', text: 'Phương án D' },
          ],
        };
      });
    }

    onSaveMatrix(savedMatrix, generatedQuestions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full flex flex-col max-h-[92vh] overflow-hidden border-2 border-purple-300"
        onMouseUp={() => setIsMouseDown(false)}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-600 px-4 py-3 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Grid className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Thiết kế bảng ma trận giải mã</h3>
              <p className="text-[11px] text-purple-200">
                Tạo 2 dòng chữ, chọn kích thước bảng hoặc vẽ tự do lên ma trận
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Preview Toggle Button */}
            <button
              type="button"
              onClick={() => setIsPreviewComplete(!isPreviewComplete)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                isPreviewComplete
                  ? 'bg-amber-400 text-amber-950 shadow-sm ring-2 ring-white scale-102'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              title="Xem trước kết quả khi hoàn thành toàn bộ câu hỏi"
            >
              {isPreviewComplete ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{isPreviewComplete ? 'Đang Xem màu' : 'Xem trước màu'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - 2 Columns fitting nicely inside viewport */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col md:flex-row gap-4 items-stretch bg-slate-50/60">
          {/* Controls Sidebar */}
          <div className="w-full md:w-80 shrink-0 space-y-3 flex flex-col">
            {/* Section 1: 2-Line Text Generator */}
            <div className="bg-white border-2 border-purple-200 rounded-xl p-3 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase text-purple-900 tracking-wider flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-purple-600" /> Nhập 2 hàng chữ để tô màu:
                </label>
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">
                  Pixel Text
                </span>
              </div>

              <div className="space-y-1.5">
                <div>
                  <span className="text-[11px] font-bold text-slate-500">Hàng 1 (Dòng trên):</span>
                  <input
                    type="text"
                    value={line1}
                    onChange={(e) => setLine1(e.target.value.toUpperCase())}
                    placeholder="VD: BIET ON"
                    maxLength={16}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-purple-200 rounded-lg text-xs font-bold uppercase focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500">Hàng 2 (Dòng dưới):</span>
                  <input
                    type="text"
                    value={line2}
                    onChange={(e) => setLine2(e.target.value.toUpperCase())}
                    placeholder="VD: THAY CO"
                    maxLength={16}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-purple-200 rounded-lg text-xs font-bold uppercase focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] bg-purple-50 p-2 rounded-lg border border-purple-200">
                <label className="flex items-center gap-1.5 font-bold text-purple-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoFitMatrix}
                    onChange={(e) => {
                      setAutoFitMatrix(e.target.checked);
                      if (e.target.checked) {
                        handleResize(optimalSize.rows, optimalSize.cols);
                      }
                    }}
                    className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <span>Tự động chỉnh ma trận vừa chữ</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleResize(optimalSize.rows, optimalSize.cols)}
                  className="px-2 py-0.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10px] rounded shadow-xs"
                  title="Đặt kích thước vừa vặn nhất cho các chữ đã nhập"
                >
                  Vừa: {optimalSize.rows}×{optimalSize.cols}
                </button>
              </div>

              <button
                type="button"
                onClick={handleApply2LineText}
                className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-transform active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Tạo chữ 2 hàng lên ma trận</span>
              </button>
            </div>

            {/* Section 2: Matrix Dimensions Customizer */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-slate-500" /> Kích thước ma trận:
                </label>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                  {rows} × {cols}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-500">Số hàng:</span>
                  <select
                    value={rows}
                    onChange={(e) => handleResize(Number(e.target.value), cols)}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                  >
                    {Array.from(new Set([8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24, rows]))
                      .sort((a, b) => a - b)
                      .map((n) => (
                        <option key={n} value={n}>
                          {n} hàng
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500">Số cột:</span>
                  <select
                    value={cols}
                    onChange={(e) => handleResize(rows, Number(e.target.value))}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                  >
                    {Array.from(new Set([10, 12, 14, 15, 16, 17, 18, 20, 22, 24, 26, cols]))
                      .sort((a, b) => a - b)
                      .map((n) => (
                        <option key={n} value={n}>
                          {n} cột
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Quick Size Presets */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {[
                  { label: `Vừa chữ (${optimalSize.rows}×${optimalSize.cols})`, r: optimalSize.rows, c: optimalSize.cols },
                  { label: '14×16', r: 14, c: 16 },
                  { label: '16×16', r: 16, c: 16 },
                  { label: '16×20', r: 16, c: 20 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleResize(preset.r, preset.c)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer ${
                      rows === preset.r && cols === preset.c
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Mẫu hình vẽ & Ký tự mật mã */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2 flex-1">
              <label className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <Paintbrush className="w-3.5 h-3.5 text-slate-500" /> Chọn ký tự để vẽ lên ô:
              </label>

              <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                {availableCiphers.map((c, idx) => {
                  const isSelected = selectedLetter === c.cipherLetter;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedLetter(c.cipherLetter)}
                      className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-xs font-bold transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-purple-600 border-purple-600 bg-purple-50'
                          : 'border-slate-200 bg-white hover:bg-slate-100'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full inline-block shrink-0 shadow-2xs"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="font-black">{c.cipherLetter}</span>
                      <span className="text-[10px] text-slate-400 truncate">({c.name})</span>
                    </button>
                  );
                })}
              </div>

              {/* Template Buttons & Clear Button */}
              <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleApplyHeart}
                  className="py-1 px-2 bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs rounded-lg border border-pink-200 transition-colors cursor-pointer"
                >
                  ❤️ Trái Tim
                </button>
                <button
                  type="button"
                  onClick={handleApplyStar}
                  className="py-1 px-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-lg border border-amber-200 transition-colors cursor-pointer"
                >
                  ⭐ Ngôi Sao
                </button>
              </div>

              {/* Clear Art Button (Xóa hình cũ) */}
              <button
                type="button"
                onClick={handleClearArt}
                className="w-full py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs rounded-lg border border-rose-200 transition-colors flex items-center justify-center gap-1.5 mt-1 cursor-pointer"
                title="Xóa bỏ các hình vẽ cũ về trạng thái chữ nền"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa hình cũ (Làm sạch)</span>
              </button>
            </div>
          </div>

          {/* Matrix Grid Canvas Viewport */}
          <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl p-2 sm:p-3 border-2 border-purple-200 shadow-inner overflow-hidden">
            <div className="flex items-center justify-between w-full max-w-lg mb-1.5 px-1">
              <span className="text-xs font-bold text-slate-700">
                Ma trận {rows} hàng × {cols} cột{' '}
                {isPreviewComplete && (
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-black">
                    ✓ Đang xem trước màu
                  </span>
                )}
              </span>
              <span className="text-[11px] text-slate-500">
                {isPreviewComplete ? 'Màu khi giải đúng' : 'Nhấp hoặc kéo chuột để vẽ'}
              </span>
            </div>

            <div
              className="grid gap-[2px] p-2 bg-slate-100 rounded-xl shadow-inner overflow-hidden border border-slate-300"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                width: '100%',
                maxWidth: '460px',
                maxHeight: '460px',
                aspectRatio: `${cols} / ${rows}`,
              }}
              onMouseDown={() => setIsMouseDown(true)}
            >
              {grid.slice(0, rows).map((row, rIdx) =>
                row.slice(0, cols).map((cellLetter, cIdx) => {
                  const cellQOrder = cellQuestionOrders[rIdx]?.[cIdx];
                  const linkedCipher = cellQOrder
                    ? availableCiphers.find((c) => c.order === cellQOrder)
                    : availableCiphers.find((c) => c.cipherLetter === cellLetter);

                  const isCipher = !!linkedCipher;
                  const showColor = isPreviewComplete && isCipher;

                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => !isPreviewComplete && handleCellClick(rIdx, cIdx)}
                      onMouseEnter={() => !isPreviewComplete && handleCellMouseEnter(rIdx, cIdx)}
                      className={`
                        aspect-square flex items-center justify-center font-black rounded-xs select-none transition-all
                        ${
                          showColor
                            ? 'text-white shadow-2xs font-extrabold'
                            : isCipher
                            ? 'bg-purple-100 text-purple-900 border border-purple-300'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-purple-50'
                        }
                        ${!isPreviewComplete ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                      `}
                      style={{
                        backgroundColor: showColor && linkedCipher ? linkedCipher.hex : undefined,
                        fontSize: `clamp(8px, ${Math.max(10, 240 / Math.max(rows, cols))}px, 14px)`,
                        lineHeight: 1,
                      }}
                      title={`${cellLetter} ${linkedCipher ? `(Câu ${linkedCipher.order}: ${linkedCipher.name})` : '(Chữ nền)'}`}
                    >
                      {cellLetter}
                    </div>
                  );
                })
              )}
            </div>

            <p className="text-[11px] text-slate-500 mt-2 text-center">
              💡 Nhập 2 hàng chữ ở bảng bên trái rồi nhấn <strong>"Tạo chữ 2 hàng lên ma trận"</strong> để tạo hình thông điệp tự động!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            {(!questions || questions.length === 0) && (
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-purple-800 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
                <input
                  type="checkbox"
                  checked={autoCreateQuestionsIfEmpty}
                  onChange={(e) => setAutoCreateQuestionsIfEmpty(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <span>Tự động tạo câu hỏi trắc nghiệm tương ứng cho các chữ cái</span>
              </label>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-xs sm:text-sm text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>LƯU BẢNG MA TRẬN & ÁP DỤNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
