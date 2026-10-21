import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Share2,
  Users,
  Edit3,
  Link as LinkIcon,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { QuizData } from '../types';
import { encodeQuizToUrl } from '../utils/urlSharing';
import { createShortUrl, generateGamePin } from '../utils/shortenLink';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizData;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, quiz }) => {
  const [copiedType, setCopiedType] = useState<'student' | 'short' | 'pin' | 'teacher' | null>(null);
  const [shortUrl, setShortUrl] = useState<string>('');
  const [isShortening, setIsShortening] = useState<boolean>(false);
  const [gamePin, setGamePin] = useState<string>('');

  const fullStudentLink = encodeQuizToUrl(quiz, 'play');
  const teacherLink = encodeQuizToUrl(quiz, 'edit');

  useEffect(() => {
    if (isOpen) {
      const pin = generateGamePin(quiz);
      setGamePin(pin);
      // Auto attempt short URL
      setIsShortening(true);
      const origin = window.location.origin + window.location.pathname;
      const reliablePresetLink = (quiz.id === 'hoa-hoc-11-alkene' || quiz.id === 'protein-enzyme-12' || quiz.id === 'sinh-hoc-te-bao')
        ? `${origin}#preset=${quiz.id}`
        : null;

      createShortUrl(fullStudentLink)
        .then((res) => {
          if (res && res !== fullStudentLink && res.startsWith('http')) {
            setShortUrl(res);
          } else if (reliablePresetLink) {
            setShortUrl(reliablePresetLink);
          } else {
            setShortUrl(fullStudentLink);
          }
        })
        .catch(() => {
          if (reliablePresetLink) {
            setShortUrl(reliablePresetLink);
          } else {
            setShortUrl(fullStudentLink);
          }
        })
        .finally(() => setIsShortening(false));
    }
  }, [isOpen, fullStudentLink, quiz]);

  if (!isOpen) return null;

  const handleCopy = (text: string, type: 'student' | 'short' | 'pin' | 'teacher') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    });
  };

  const activeShareLink = shortUrl || fullStudentLink;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(activeShareLink)}`;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full flex flex-col max-h-[92vh] overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-200" />
            <h3 className="font-extrabold text-base sm:text-lg">Chia sẻ trò chơi cho học sinh</h3>
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
          {/* Section 1: Shortened Link (Prominent) */}
          <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-emerald-600" /> Link rút gọn cho học sinh:
              </span>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full">
                ⚡ Đã rút gọn
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Link ngắn gọn, dễ gửi qua Zalo, Messenger, Google Classroom để học sinh vào làm ngay:
            </p>

            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-emerald-300 shadow-2xs">
              <input
                type="text"
                readOnly
                value={isShortening ? 'Đang tạo link rút gọn...' : shortUrl || fullStudentLink}
                className="w-full text-xs font-mono font-bold text-emerald-800 bg-transparent outline-none truncate"
              />
              <button
                type="button"
                onClick={() => handleCopy(shortUrl || fullStudentLink, 'short')}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg transition-transform active:scale-95 shrink-0 flex items-center gap-1 cursor-pointer"
              >
                {copiedType === 'short' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 2: Game PIN / Room Code & QR Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Game PIN Code Box */}
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[11px] font-black uppercase text-amber-900 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-700" /> Mã PIN đề bài:
                </span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Giáo viên có thể viết mã này lên bảng cho học sinh nhập:
                </p>
              </div>

              <div className="text-center py-2 bg-white rounded-xl border border-amber-200 shadow-inner">
                <span className="text-xl font-black font-mono tracking-widest text-rose-600">
                  {gamePin || 'MTR-1234'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(gamePin, 'pin')}
                className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                {copiedType === 'pin' ? 'Đã sao chép mã!' : 'Sao chép mã PIN'}
              </button>
            </div>

            {/* QR Code Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-1.5">
              <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <img
                  src={qrCodeUrl}
                  alt="QR Code bài làm"
                  className="w-24 h-24 object-contain rounded"
                  loading="lazy"
                />
              </div>
              <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1">
                <QrCode className="w-3 h-3 text-teal-600" />
                <span>Quét mã QR trên lớp</span>
              </span>
              <a
                href={activeShareLink}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-0.5"
              >
                <span>Mở tab mới</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Section 3: Full Link Fallback */}
          <details className="text-xs text-slate-500 border border-slate-200 rounded-xl p-2.5 bg-slate-50">
            <summary className="font-bold cursor-pointer text-slate-700 hover:text-slate-900">
              Xem link đầy đủ (Đã mã hóa toàn bộ đề)
            </summary>
            <div className="mt-2 space-y-1">
              <input
                type="text"
                readOnly
                value={fullStudentLink}
                className="w-full text-[11px] font-mono text-slate-500 bg-white p-1.5 rounded border border-slate-200 outline-none truncate"
              />
              <button
                type="button"
                onClick={() => handleCopy(fullStudentLink, 'student')}
                className="text-[11px] text-blue-600 font-bold hover:underline"
              >
                {copiedType === 'student' ? 'Đã chép link đầy đủ' : 'Sao chép link đầy đủ'}
              </button>
            </div>
          </details>
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
