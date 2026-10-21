import React, { useState } from 'react';
import {
  X,
  FileText,
  Printer,
  Image as ImageIcon,
  FileCode,
  CheckCircle2,
  Sparkles,
  Download,
  Check,
} from 'lucide-react';
import { QuizData, StudentInfo } from '../types';
import { exportQuizAsWordDocx } from '../utils/exportWord';
import { exportQuizAsJson, exportAsPdf, exportElementAsPng } from '../utils/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizData;
  studentInfo: StudentInfo;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  quiz,
  studentInfo,
}) => {
  const [exportingType, setExportingType] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Export Word for Students to color by hand
  const handleExportWordStudent = async () => {
    setExportingType('word-student');
    try {
      await exportQuizAsWordDocx(quiz, studentInfo, false);
    } catch (err) {
      console.error('Word export failed', err);
      alert('Lỗi tạo file Word: ' + (err as Error).message);
    } finally {
      setExportingType(null);
    }
  };

  // 2. Export Word with Answer Key & Colored Matrix
  const handleExportWordTeacher = async () => {
    setExportingType('word-teacher');
    try {
      await exportQuizAsWordDocx(quiz, studentInfo, true);
    } catch (err) {
      console.error('Word teacher export failed', err);
      alert('Lỗi tạo file Word: ' + (err as Error).message);
    } finally {
      setExportingType(null);
    }
  };

  const handleNativePrint = () => {
    window.print();
  };

  const handleExportPng = async () => {
    setExportingType('png');
    try {
      await exportElementAsPng('printable-matrix-card', `giai-ma-sac-mau-${studentInfo.name || 'hoc-sinh'}`);
    } finally {
      setExportingType(null);
    }
  };

  const handleDownloadJson = () => {
    exportQuizAsJson(quiz);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[92vh] overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-4 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-200" />
            <h3 className="font-extrabold text-base sm:text-lg">Xuất file Word & In phiếu học tập</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <p className="text-xs sm:text-sm text-slate-600">
            Xuất phiếu bài tập dạng Microsoft Word (.docx) chuẩn khổ A4 để in phát cho học sinh làm bài và tự tô màu bằng bút chì màu:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Option 1: Word Document for Students */}
            <button
              type="button"
              onClick={handleExportWordStudent}
              disabled={!!exportingType}
              className="flex items-start gap-3 p-4 rounded-2xl border-2 border-blue-400 bg-blue-50/70 hover:bg-blue-100/70 hover:border-blue-600 transition-all text-left group cursor-pointer shadow-xs"
            >
              <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-black text-sm text-blue-950">
                    Xuất file Word (.docx) cho HS
                  </h4>
                  <span className="text-[10px] bg-blue-200 text-blue-900 font-extrabold px-1.5 py-0.5 rounded">
                    Khuyên dùng
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tạo file Word chứa bảng ma trận trắng chuẩn ô vuông, bảng mật mã và câu hỏi trắc nghiệm để in phát cho học sinh tô màu bằng tay.
                </p>
                {exportingType === 'word-student' && (
                  <span className="text-xs font-bold text-blue-700 animate-pulse block">
                    Đang tạo file Word (.docx)...
                  </span>
                )}
              </div>
            </button>

            {/* Option 2: Word with Solved Answer Key */}
            <button
              type="button"
              onClick={handleExportWordTeacher}
              disabled={!!exportingType}
              className="flex items-start gap-3 p-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/70 hover:border-emerald-500 transition-all text-left group cursor-pointer shadow-xs"
            >
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-sm text-emerald-950">
                  Xuất file Word kèm Đáp án
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tạo file Word có ma trận đã tô màu đầy đủ và đánh dấu đáp án đúng để giáo viên đối chiếu chấm bài.
                </p>
                {exportingType === 'word-teacher' && (
                  <span className="text-xs font-bold text-emerald-700 animate-pulse block">
                    Đang tạo file Word đáp án...
                  </span>
                )}
              </div>
            </button>

            {/* Option 3: Print Directly A4 */}
            <button
              type="button"
              onClick={handleNativePrint}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 transition-all text-left group cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-slate-700 text-white shrink-0 group-hover:scale-105 transition-transform">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 mb-0.5">
                  In trực tiếp ra máy in (A4)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Mở hộp thoại in trình duyệt chuẩn hóa khổ giấy A4 ngay lập tức.
                </p>
              </div>
            </button>

            {/* Option 4: Export PNG Image */}
            <button
              type="button"
              onClick={handleExportPng}
              disabled={!!exportingType}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/50 transition-all text-left group cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-purple-600 text-white shrink-0 group-hover:scale-105 transition-transform">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-purple-950 mb-0.5">
                  Tải ảnh ma trận (PNG)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Tải ảnh chụp ma trận sắc màu độ phân giải cao để chèn giáo án, trình chiếu.
                </p>
              </div>
            </button>
          </div>

          {/* Backup JSON */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Muốn sao lưu bộ câu hỏi để gửi cho đồng nghiệp nạp lại?
            </span>
            <button
              type="button"
              onClick={handleDownloadJson}
              className="text-xs font-bold text-amber-700 hover:text-amber-900 underline flex items-center gap-1 cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Tải file đề (.json)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end shrink-0">
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
  );
};
