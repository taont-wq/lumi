import React, { useState } from 'react';
import { Search, Building, Layers, Compass, LayoutGrid, RotateCcw, ArrowRight } from 'lucide-react';
import { ApartmentUnitType, AppSettings, Project } from '../types';

interface HeroSearchProps {
  settings: AppSettings;
  projects: Project[];
  selectedProjectId: string;
  selectedTower: string;
  selectedAxis: string;
  selectedUnitType: ApartmentUnitType | 'all';
  searchKeyword: string;
  availableTowers: string[];
  availableAxes: string[];
  onProjectChange: (projectId: string) => void;
  onTowerChange: (tower: string) => void;
  onAxisChange: (axis: string) => void;
  onUnitTypeChange: (type: ApartmentUnitType | 'all') => void;
  onKeywordChange: (keyword: string) => void;
  onSearchSubmit: () => void;
  onResetFilter: () => void;
  totalResultsCount: number;
}

export const UNIT_TYPES_LIST: { id: ApartmentUnitType | 'all'; name: string }[] = [
  { id: 'all', name: 'Tất cả dạng căn' },
  { id: 'studio', name: 'Studio' },
  { id: '1pn', name: '1 Phòng Ngủ (1PN)' },
  { id: '1pn_plus', name: '1 Phòng Ngủ + 1 (1PN+1)' },
  { id: '2pn_1wc', name: '2 Phòng Ngủ - 1WC' },
  { id: '2pn_2wc', name: '2 Phòng Ngủ - 2WC' },
  { id: '3pn', name: '3 Phòng Ngủ (3PN)' },
  { id: 'duplex', name: 'Duplex / Penthouse' },
];

export const HeroSearch: React.FC<HeroSearchProps> = ({
  settings,
  projects,
  selectedProjectId,
  selectedTower,
  selectedAxis,
  selectedUnitType,
  searchKeyword,
  availableTowers,
  availableAxes,
  onProjectChange,
  onTowerChange,
  onAxisChange,
  onUnitTypeChange,
  onKeywordChange,
  onSearchSubmit,
  onResetFilter,
  totalResultsCount,
}) => {
  const [localKeyword, setLocalKeyword] = useState(searchKeyword);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onKeywordChange(localKeyword);
    onSearchSubmit();
  };

  return (
    <section className="relative bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-slate-200">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {settings.heroHeadline || 'Tra Cứu Sơ Đồ Mặt Bằng & Mẫu Nội Thất 3D'}
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {settings.heroSubheadline ||
              'Chọn dự án, tòa tháp và trục căn để tra cứu nhanh sơ đồ mặt bằng kỹ thuật 2D/CAD, khám phá mẫu thiết kế 3D thực tế và video bàn giao.'}
          </p>
        </div>

        {/* Main Search Filter Box */}
        <div className="max-w-6xl mx-auto bg-white rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-200/90 relative">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Step 1 -> 2 -> 3 -> 4 -> 5 Filter Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
              {/* 1. Chọn Dự Án */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-700 flex items-center space-x-1.5">
                  <Building className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">1. Chọn Dự Án</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedProjectId}
                    onChange={(e) => onProjectChange(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 font-medium text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 py-3 px-3 transition-all cursor-pointer appearance-none truncate pr-8"
                  >
                    <option value="all">Tất cả dự án ({projects.length})</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* 2. Chọn Tòa Tháp (Sau khi chọn dự án) */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-700 flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="truncate">2. Chọn Tòa Tháp</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedTower}
                    onChange={(e) => onTowerChange(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 font-medium text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 py-3 px-3 transition-all cursor-pointer appearance-none truncate pr-8"
                  >
                    <option value="all">
                      {selectedProjectId === 'all'
                        ? 'Tất cả tòa tháp'
                        : `Tất cả tòa thuộc ${projects.find((p) => p.id === selectedProjectId)?.name || 'dự án'}`}
                    </option>
                    {availableTowers.map((tower) => (
                      <option key={tower} value={tower}>
                        {tower}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* 3. Chọn Trục Căn Chung Cư (Sau khi chọn tòa tháp) */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-700 flex items-center space-x-1.5">
                  <Compass className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="truncate">3. Chọn Trục Căn</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedAxis}
                    onChange={(e) => onAxisChange(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 font-medium text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 py-3 px-3 transition-all cursor-pointer appearance-none truncate pr-8"
                  >
                    <option value="all">Tất cả trục căn ({availableAxes.length})</option>
                    {availableAxes.map((axis) => (
                      <option key={axis} value={axis}>
                        {axis}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* 4. Chọn Dạng Căn Điển Hình */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-700 flex items-center space-x-1.5">
                  <LayoutGrid className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">4. Dạng Căn Hộ</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedUnitType}
                    onChange={(e) => onUnitTypeChange(e.target.value as ApartmentUnitType | 'all')}
                    className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 font-medium text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 py-3 px-3 transition-all cursor-pointer appearance-none truncate pr-8"
                  >
                    {UNIT_TYPES_LIST.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* 5. Nhập Mã Căn / Tòa / Từ Khóa */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-700 flex items-center space-x-1.5">
                  <Search className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">5. Nhập Mã Căn</span>
                </label>
                <input
                  type="text"
                  value={localKeyword}
                  onChange={(e) => setLocalKeyword(e.target.value)}
                  placeholder="Ví dụ: S2.05, 12A08..."
                  className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 font-medium text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 py-3 px-3 transition-all"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-slate-100 gap-3">
              {/* Quick Reset Filter */}
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-500 w-full sm:w-auto justify-between sm:justify-start">
                <span>
                  Tìm thấy <strong className="text-blue-600 font-bold">{totalResultsCount}</strong> căn hộ phù hợp
                </span>
                {(selectedProjectId !== 'all' ||
                  selectedTower !== 'all' ||
                  selectedAxis !== 'all' ||
                  selectedUnitType !== 'all' ||
                  localKeyword.trim() !== '') && (
                  <button
                    type="button"
                    onClick={() => {
                      setLocalKeyword('');
                      onResetFilter();
                    }}
                    className="inline-flex items-center space-x-1 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Xóa bộ lọc</span>
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 shadow-md shadow-blue-500/25 transition-all cursor-pointer text-sm sm:text-base"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Tìm Kiếm Căn Hộ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
