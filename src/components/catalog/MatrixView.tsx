/**
 * MatrixView - bảng ma trận tra cứu căn hộ.
 * Tách riêng từ CatalogTreeManager.
 */

import React from 'react';
import { Search, Copy, Trash2 } from 'lucide-react';
import { ApartmentUnit, ApartmentUnitType, AppSettings, Project } from '../../types';
import type { CatalogState } from './useCatalogState';
import { ShareUnitButton } from '../ShareUnitButton';

interface MatrixViewProps {
  projects: Project[];
  apartments: ApartmentUnit[];
  settings: AppSettings;
  state: CatalogState;
  onOpenApartmentEditor: (apt: ApartmentUnit) => void;
}

export const MatrixView: React.FC<MatrixViewProps> = ({
  projects,
  apartments,
  settings,
  state,
  onOpenApartmentEditor,
}) => {
  const s = state;
  const countBy = (list: ApartmentUnit[], key: (a: ApartmentUnit) => string) => {
    const m = new Map<string, number>();
    list.forEach((a) => {
      const k = key(a);
      if (k) m.set(k, (m.get(k) || 0) + 1);
    });
    return m;
  };
  const projectCounts = countBy(apartments, (a) => a.projectId);
  const towerPool =
    s.matrixProjectFilter === 'all'
      ? apartments
      : apartments.filter((a) => a.projectId === s.matrixProjectFilter);
  const towerCounts = countBy(towerPool, (a) => (a.tower || '').trim());
  const axisPool =
    s.matrixTowerFilter === 'all'
      ? towerPool
      : towerPool.filter((a) => (a.tower || '').trim() === s.matrixTowerFilter.trim());
  const axisCounts = countBy(axisPool, (a) => (a.axisNumber || '').trim());
  const typeCounts = countBy(axisPool, (a) => a.unitType);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 p-4">
      {/* Matrix Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Tìm kiếm từ khóa:</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Mã căn, tòa, trục, hướng..."
              value={s.matrixSearch}
              onChange={(e) => s.setMatrixSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Lọc Dự Án:</label>
          <select
            value={s.matrixProjectFilter}
            onChange={(e) => {
              s.setMatrixProjectFilter(e.target.value);
              s.setMatrixTowerFilter('all');
              s.setMatrixAxisFilter('all');
            }}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 font-medium"
          >
            <option value="all">Tất cả dự án ({projects.length} • {apartments.length} căn)</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({projectCounts.get(p.id) || 0})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Lọc Tòa Tháp:</label>
          <select
            value={s.matrixTowerFilter}
            onChange={(e) => {
              s.setMatrixTowerFilter(e.target.value);
              s.setMatrixAxisFilter('all');
            }}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 font-medium"
          >
            <option value="all">Tất cả tòa tháp ({s.availableTowersForMatrix.length} • {towerPool.length} căn)</option>
            {s.availableTowersForMatrix.map((t) => (
              <option key={t} value={t}>
                {t} ({towerCounts.get(t.trim()) || 0})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Lọc Trục Căn:</label>
          <select
            value={s.matrixAxisFilter}
            onChange={(e) => s.setMatrixAxisFilter(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 font-medium"
          >
            <option value="all">Tất cả trục ({s.availableAxesForMatrix.length} • {axisPool.length} căn)</option>
            {s.availableAxesForMatrix.map((ax) => (
              <option key={ax} value={ax}>
                {ax} ({axisCounts.get(ax.trim()) || 0})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Lọc Dạng Căn:</label>
          <select
            value={s.matrixUnitTypeFilter}
            onChange={(e) => s.setMatrixUnitTypeFilter(e.target.value as ApartmentUnitType | 'all')}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 font-medium"
          >
            <option value="all">Tất cả dạng căn ({axisPool.length} căn)</option>
            <option value="studio">Studio ({typeCounts.get('studio') || 0})</option>
            <option value="1pn">1 Phòng Ngủ ({typeCounts.get('1pn') || 0})</option>
            <option value="1pn_plus">1 Phòng Ngủ + 1 ({typeCounts.get('1pn_plus') || 0})</option>
            <option value="2pn_1wc">2 Phòng Ngủ - 1WC ({typeCounts.get('2pn_1wc') || 0})</option>
            <option value="2pn_2wc">2 Phòng Ngủ - 2WC ({typeCounts.get('2pn_2wc') || 0})</option>
            <option value="3pn">3 Phòng Ngủ ({typeCounts.get('3pn') || 0})</option>
            <option value="duplex">Duplex ({typeCounts.get('duplex') || 0})</option>
            <option value="penthouse">Penthouse ({typeCounts.get('penthouse') || 0})</option>
          </select>
        </div>
      </div>

      {/* Matrix Results Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">
            Kết quả: {s.matrixFilteredApartments.length} / {apartments.length} căn hộ
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">Sắp xếp theo:</span>
            <button
              onClick={() => {
                if (s.matrixSortBy === 'unitCode') {
                  s.setMatrixSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                } else {
                  s.setMatrixSortBy('unitCode');
                  s.setMatrixSortOrder('asc');
                }
              }}
              className={`px-2 py-1 rounded font-bold ${
                s.matrixSortBy === 'unitCode' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200'
              }`}
            >
              Mã Căn {s.matrixSortBy === 'unitCode' && (s.matrixSortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => {
                if (s.matrixSortBy === 'netArea') {
                  s.setMatrixSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                } else {
                  s.setMatrixSortBy('netArea');
                  s.setMatrixSortOrder('asc');
                }
              }}
              className={`px-2 py-1 rounded font-bold ${
                s.matrixSortBy === 'netArea' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200'
              }`}
            >
              Diện Tích {s.matrixSortBy === 'netArea' && (s.matrixSortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3">Mã Căn</th>
                <th className="py-2.5 px-3">Dự Án</th>
                <th className="py-2.5 px-3">Tòa Tháp</th>
                <th className="py-2.5 px-3">Trục Căn</th>
                <th className="py-2.5 px-3">Dạng Căn</th>
                <th className="py-2.5 px-3">DT Thông Thủy</th>
                <th className="py-2.5 px-3">Hướng</th>
                <th className="py-2.5 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {s.matrixFilteredApartments.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-extrabold text-slate-900">{apt.unitCode}</td>
                  <td className="py-2.5 px-3 font-medium text-blue-600">{apt.projectName}</td>
                  <td className="py-2.5 px-3">{apt.tower}</td>
                  <td className="py-2.5 px-3 font-bold text-amber-700">
                    {apt.axisNumber || 'Chưa gán'}
                  </td>
                  <td className="py-2.5 px-3">{apt.unitTypeName}</td>
                  <td className="py-2.5 px-3 font-bold">{apt.netArea} m²</td>
                  <td className="py-2.5 px-3 text-slate-500">{apt.direction || '—'}</td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <span className="inline-flex mr-1 align-middle" title="Copy bài/link chia sẻ căn này">
                      <ShareUnitButton apartment={apt} settings={settings} />
                    </span>
                    <button
                      onClick={() => onOpenApartmentEditor(apt)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-xs mr-1 cursor-pointer"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => s.handleDuplicateUnit(apt)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer mr-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => s.handleDeleteUnit(apt.id, apt.unitCode)}
                      className="p-1 text-red-500 hover:bg-red-100 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
