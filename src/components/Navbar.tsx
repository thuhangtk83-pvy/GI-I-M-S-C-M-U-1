import React from 'react';
import {
  Sparkles,
  Share2,
  Edit,
  BookOpen,
  Volume2,
  VolumeX,
  FileDown,
  FileText,
  GraduationCap,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface NavbarProps {
  onOpenShareModal: () => void;
  onOpenEditorModal: () => void;
  onOpenLibraryModal: () => void;
  onOpenExportModal: () => void;
  onOpenQuickImportModal?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenShareModal,
  onOpenEditorModal,
  onOpenLibraryModal,
  onOpenExportModal,
  onOpenQuickImportModal,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-500 to-emerald-500 p-0.5 shadow-sm flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-white rounded-[10px] sm:rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 fill-amber-400" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm sm:text-lg md:text-xl tracking-tight bg-gradient-to-r from-rose-600 via-amber-600 to-emerald-600 bg-clip-text text-transparent truncate">
                GIẢI MÃ SẮC MÀU
              </span>
              <span className="hidden md:inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                <GraduationCap className="w-3 h-3" /> Học tập tương tác
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block">
              Giải mã câu hỏi trắc nghiệm & tô màu bức tranh bí ẩn
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Share Button */}
          <button
            type="button"
            onClick={onOpenShareModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
            title="Chia sẻ link cho học sinh làm bài"
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Chia sẻ link học sinh</span>
            <span className="sm:hidden">Chia sẻ</span>
          </button>

          {/* Library Button - Always visible on mobile and desktop */}
          <button
            type="button"
            onClick={onOpenLibraryModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
            title="Thư viện đề thi"
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="inline">Thư viện</span>
          </button>

          {/* Edit Quiz Button */}
          <button
            type="button"
            onClick={onOpenEditorModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3.5 sm:py-2 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
            title="Tạo / Chỉnh sửa bộ câu hỏi"
          >
            <Edit className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">Sửa đề</span>
          </button>

          {/* Quick Import Button */}
          {onOpenQuickImportModal && (
            <button
              type="button"
              onClick={onOpenQuickImportModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-extrabold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
              title="Dán nhanh câu hỏi trắc nghiệm từ Word (Alkene, Hóa học...)"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Dán đề Word</span>
            </button>
          )}

          {/* Export Word */}
          <button
            type="button"
            onClick={onOpenExportModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-extrabold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
            title="Xuất file Word (.docx) để in"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Xuất file Word</span>
          </button>

          {/* Audio toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
