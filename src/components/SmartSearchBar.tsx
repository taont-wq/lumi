/**
 * SmartSearchBar — ô tìm kiếm bằng tiếng Việt tự nhiên.
 * File mới 100%, không sửa logic search/filter cũ.
 * Ví dụ: "căn 2 ngủ dưới 70m2 view hồ" → parse → onApply(filters).
 */

import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import {
  SmartFilters,
  parseSmartQuery,
  describeSmartFilters,
  EMPTY_SMART_FILTERS,
} from '../lib/vietnameseSearch';

interface SmartSearchBarProps {
  onApply: (filters: SmartFilters) => void;
  onClear: () => void;
}

export const SmartSearchBar: React.FC<SmartSearchBarProps> = ({ onApply, onClear }) => {
  const [input, setInput] = useState('');
  const [activeChips, setActiveChips] = useState<string[]>([]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const filters = parseSmartQuery(input);
    setActiveChips(describeSmartFilters(filters));
    onApply(filters);
  };

  const handleClear = () => {
    setInput('');
    setActiveChips([]);
    onClear();
  };

  const isEmpty =
    activeChips.length === 0 &&
    JSON.stringify(parseSmartQuery(input)) === JSON.stringify({ ...EMPTY_SMART_FILTERS, raw: input.trim() });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 sm:p-5 shadow-md"
      >
        <label className="flex items-center space-x-2 text-white text-xs sm:text-sm font-bold mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Tìm căn thông minh — gõ tiếng Việt tự nhiên</span>
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='VD: căn 2 ngủ dưới 70m2 view hồ hướng đông'
            className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/70"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl cursor-pointer"
            >
              Tìm thông minh
            </button>
            {!isEmpty && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl cursor-pointer"
                title="Xóa tìm kiếm thông minh"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {activeChips.map((chip) => (
              <span
                key={chip}
                className="px-2.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-semibold"
              >
                {chip}
              </span>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};
