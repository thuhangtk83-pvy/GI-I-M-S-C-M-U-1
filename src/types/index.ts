export interface OptionItem {
  id: string;
  cipherLetter: string; // The cipher letter shown in circle badge, e.g. 'M', 'K', 'Z', 'Y'
  text: string;
}

export interface Question {
  id: string;
  order: number;
  questionText: string;
  options: OptionItem[];
  correctOptionIndex: number; // 0, 1, 2, or 3
  cipherLetter: string; // The cipher letter on the matrix grid that lights up when answered correctly
  cipherColorName: string; // e.g., 'Đỏ', 'Vàng', 'Xanh lá', 'Xanh dương', 'Cam', 'Tím', 'Hồng'
  cipherColorHex: string; // e.g., '#ef4444'
  explanation?: string;
}

export interface MatrixGridConfig {
  rows: number;
  cols: number;
  // 2D array of uppercase letters
  grid: string[][];
  // mapping of letter to target color
  cipherColors: Record<string, { name: string; hex: string; questionId?: string }>;
  // Optional 2D array mapping each cell directly to a question order (1..N)
  cellQuestionOrders?: (number | null)[][];
}

export interface QuizData {
  id: string;
  title: string;
  subject: string;
  grade: string;
  secretMessage: string;
  matrix: MatrixGridConfig;
  questions: Question[];
  createdAt?: string;
}

export interface StudentAnswers {
  [questionId: string]: {
    selectedIndex: number;
    isCorrect: boolean;
  };
}

export interface StudentInfo {
  name: string;
  studentClass: string;
}

export const PRESET_COLORS: { name: string; hex: string; bgClass: string; textClass: string }[] = [
  { name: 'Đỏ', hex: '#ef4444', bgClass: 'bg-red-500', textClass: 'text-red-600' },
  { name: 'Cam', hex: '#f97316', bgClass: 'bg-orange-500', textClass: 'text-orange-600' },
  { name: 'Vàng', hex: '#eab308', bgClass: 'bg-amber-400', textClass: 'text-amber-600' },
  { name: 'Xanh lá', hex: '#22c55e', bgClass: 'bg-emerald-500', textClass: 'text-emerald-600' },
  { name: 'Xanh dương', hex: '#0ea5e9', bgClass: 'bg-sky-500', textClass: 'text-sky-600' },
  { name: 'Xanh đậm', hex: '#3b82f6', bgClass: 'bg-blue-600', textClass: 'text-blue-600' },
  { name: 'Tím', hex: '#a855f7', bgClass: 'bg-purple-500', textClass: 'text-purple-600' },
  { name: 'Hồng', hex: '#ec4899', bgClass: 'bg-pink-500', textClass: 'text-pink-600' },
  { name: 'Nâu', hex: '#854d0e', bgClass: 'bg-amber-800', textClass: 'text-amber-800' },
  { name: 'Xám', hex: '#64748b', bgClass: 'bg-slate-500', textClass: 'text-slate-600' },
];
