import React from 'react';
import { Building2, Phone, MessageSquare, ShieldCheck, Search, PlusCircle } from 'lucide-react';
import { AppSettings, LeadRecord } from '../types';

interface NavbarProps {
  settings: AppSettings;
  isAdminAuthenticated?: boolean;
  isAdminOpen: boolean;
  onToggleAdmin: () => void;
  onScrollToSearch: () => void;
  onOpenConsultModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  isAdminAuthenticated = false,
  isAdminOpen,
  onToggleAdmin,
  onScrollToSearch,
  onOpenConsultModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
                  {settings.brandName}
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Chuẩn 100%
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Tra cứu kích thước chi tiết & thư viện mẫu 3D chung cư
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Search shortcut */}
            <button
              onClick={onScrollToSearch}
              className="hidden lg:flex items-center space-x-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Tra Cứu Mã Căn</span>
            </button>

            {/* Hotline Call */}
            <a
              href={`tel:${settings.hotline.replace(/\s+/g, '')}`}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>{settings.hotline}</span>
            </a>

            {/* Zalo CTA Button */}
            <a
              href={settings.zaloLink || `https://zalo.me/${settings.zaloNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-sm transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden xs:inline">Chat Zalo KTS</span>
              <span className="xs:hidden">Zalo</span>
            </a>

            {/* Free Consult CTA */}
            <button
              onClick={onOpenConsultModal}
              className="inline-flex items-center space-x-1 px-3.5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tư Vấn Miễn Phí</span>
            </button>

            {/* Admin Switcher (Only visible if currently in admin mode / already authenticated) */}
            {isAdminAuthenticated && (
              <button
                onClick={onToggleAdmin}
                className={`relative inline-flex items-center space-x-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-all cursor-pointer ${
                  isAdminOpen
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                }`}
                title="Quay lại trang quản trị"
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">{isAdminOpen ? 'Xem Trang Web' : 'Vào Admin'}</span>
                <span className="sm:hidden">{isAdminOpen ? 'Web' : 'Admin'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

