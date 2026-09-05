/**
 * SmartSearchModal — modal tìm căn bằng tiếng Việt tự nhiên.
 * Mở từ nút trên Navbar. File mới 100%.
 */

import React from 'react';
import { X } from 'lucide-react';
import { SmartSearchBar } from './SmartSearchBar';
import { SmartFilters } from '../lib/vietnameseSearch';

interface SmartSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: SmartFilters) => void;
  onClear: () => void;
}

export const SmartSearchModal: React.FC<SmartSearchModalProps> = ({
  isOpen,
  onClose,
  onApply,
  onClear,
}) => {
  if (!isOpen) return null;

  const handleApply = (filters: SmartFilters) => {
    onApply(filters);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-start justify-center p-4 pt-20 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 cursor-pointer"
            title="Đóng"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <SmartSearchBar onApply={handleApply} onClear={onClear} />
        <p className="text-center text-white/70 text-xs mt-3">
          VD: căn 2 ngủ dưới 70m2 view hồ hướng đông
        </p>
      </div>
    </div>
  );
};
