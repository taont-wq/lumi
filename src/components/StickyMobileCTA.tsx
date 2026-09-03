import React from 'react';
import { Phone, MessageSquare, Search, FileText } from 'lucide-react';
import { AppSettings } from '../types';

interface StickyMobileCTAProps {
  settings: AppSettings;
  onScrollToSearch: () => void;
  onOpenQuickConsult: () => void;
}

export const StickyMobileCTA: React.FC<StickyMobileCTAProps> = ({
  settings,
  onScrollToSearch,
  onOpenQuickConsult,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-2xl">
      <div className="grid grid-cols-3 gap-2 items-center">
        {/* Hotline */}
        <a
          href={`tel:${settings.hotline.replace(/\s+/g, '')}`}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-colors"
        >
          <Phone className="w-4 h-4 text-emerald-600 mb-0.5 animate-pulse" />
          <span>Gọi Hotline</span>
        </a>

        {/* Zalo */}
        <a
          href={settings.zaloLink || `https://zalo.me/${settings.zaloNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors shadow-xs"
        >
          <MessageSquare className="w-4 h-4 mb-0.5" />
          <span>Chat Zalo</span>
        </a>

        {/* Search */}
        <button
          onClick={onScrollToSearch}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors shadow-xs cursor-pointer"
        >
          <Search className="w-4 h-4 mb-0.5" />
          <span>Tra Cứu Căn</span>
        </button>
      </div>
    </div>
  );
};
