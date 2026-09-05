import React from 'react';
import { Phone, MessageSquare, ShieldCheck, PlusCircle, Home, Sparkles } from 'lucide-react';
import { AppSettings } from '../types';

interface NavbarProps {
  settings: AppSettings;
  isAdminAuthenticated?: boolean;
  isAdminOpen: boolean;
  onToggleAdmin: () => void;
  onOpenConsultModal: () => void;
  onOpenSmartSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  isAdminAuthenticated = false,
  isAdminOpen,
  onToggleAdmin,
  onOpenConsultModal,
  onOpenSmartSearch,
}) => {
  const s = settings || { hotline: '058 929 4444', hotline2: '083 555 7878', zaloNumber: '0589294444', zaloLink: 'https://zalo.me/0589294444' };
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-3">
          {/* Logo only - bỏ text "Lumi Design" + badge "Chuẩn 100%" */}
          <a
            href="https://noithatlumi.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center cursor-pointer group shrink-0"
            title="Về noithatlumi.vn"
          >
            <img
              src="/logo-Lumi-05-1-300x106.png"
              alt="Lumi Design"
              className="h-8 sm:h-9 w-auto group-hover:opacity-80 transition-opacity"
            />
          </a>

          {/* Action bar - compact, không có search */}
          <div className="flex items-center space-x-1 sm:space-x-1.5">
            {/* Về trang chủ Lumi Design (mở tab mới) */}
            <a
              href="https://noithatlumi.vn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-2.5 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 rounded-lg transition-all"
              title="Về trang chủ noithatlumi.vn"
            >
              <Home className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
              <span className="hidden md:inline whitespace-nowrap">Lumi Design</span>
            </a>

            {/* Hotline - ẩn text trên mobile, chỉ hiện icon */}
            <a
              href={`tel:${s.hotline.replace(/\s+/g, '')}`}
              className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title={s.hotline2 ? `Hotline: ${s.hotline} hoặc ${s.hotline2}` : `Hotline: ${s.hotline}`}
            >
              <Phone className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-600 animate-pulse shrink-0" />
              <span className="hidden lg:inline whitespace-nowrap">
                {s.hotline}
                {s.hotline2 ? ` - ${s.hotline2}` : ''}
              </span>
              <span className="lg:hidden whitespace-nowrap">{s.hotline}</span>
            </a>

            {/* Zalo CTA */}
            <a
              href={s.zaloLink || `https://zalo.me/${s.zaloNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-2.5 lg:px-3.5 py-1.5 lg:py-2 text-xs lg:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-sm transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
              <span className="hidden sm:inline">Zalo</span>
            </a>

            {/* Tư vấn miễn phí - primary CTA */}
            <button
              onClick={onOpenConsultModal}
              className="inline-flex items-center space-x-1.5 px-2.5 lg:px-3.5 py-1.5 lg:py-2 text-xs lg:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 lg:w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Tư Vấn</span>
            </button>

            {/* Tìm thông minh */}
            {onOpenSmartSearch && (
              <button
                onClick={onOpenSmartSearch}
                className="inline-flex items-center space-x-1.5 px-2.5 lg:px-3.5 py-1.5 lg:py-2 text-xs lg:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-lg shadow-sm transition-all cursor-pointer"
                title="Tìm căn bằng tiếng Việt tự nhiên"
              >
                <Sparkles className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
                <span className="hidden md:inline">Tìm thông minh</span>
              </button>
            )}

            {/* Admin (chỉ hiện khi đã auth) */}
            {isAdminAuthenticated && (
              <button
                onClick={onToggleAdmin}
                className={`inline-flex items-center space-x-1 px-2.5 py-1.5 lg:py-2 text-xs lg:text-sm font-semibold rounded-lg border transition-all cursor-pointer ${
                  isAdminOpen
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                }`}
                title={isAdminOpen ? 'Về trang công khai' : 'Vào trang quản trị'}
              >
                <ShieldCheck className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
                <span className="hidden lg:inline">
                  {isAdminOpen ? 'Web' : 'Admin'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
