/**
 * QuickActionModal - dialog cho các thao tác nhanh trên cây catalog.
 * Tách riêng từ CatalogTreeManager.
 */

import React from 'react';
import { X } from 'lucide-react';
import { Project } from '../../types';
import type { CatalogState } from './useCatalogState';

interface QuickActionModalProps {
  state: CatalogState;
  projects: Project[];
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({ state, projects }) => {
  const s = state;
  if (!s.quickActionModal.isOpen) return null;

  const type = s.quickActionModal.type;

  return (
    <div className="fixed inset-0 z-70 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
            {type === 'add_tower' && 'Thêm Tòa Tháp Mới Vào Dự Án'}
            {type === 'rename_tower' && 'Đổi Tên Tòa Tháp & Đồng Bộ Căn Hộ'}
            {type === 'batch_rename_axis' && 'Đổi Tên Trục Căn Hàng Loạt'}
            {type === 'add_axis' && 'Thêm Trục Căn Mới'}
            {type === 'move_units' && 'Chuyển Đổi Vị Trí Căn Hộ Đã Chọn'}
          </h4>
          <button
            onClick={() => s.setQuickActionModal({ isOpen: false, type: 'add_tower' })}
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {type !== 'move_units' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {type === 'add_tower' && 'Tên Tòa Tháp Mới:'}
                {type === 'rename_tower' && 'Tên Tòa Tháp Mới (sẽ cập nhật tất cả căn):'}
                {type === 'batch_rename_axis' && 'Tên Trục Mới (sẽ cập nhật tất cả căn trong trục):'}
                {type === 'add_axis' && 'Tên Trục Căn Mới:'}
              </label>
              <input
                type="text"
                value={s.dialogInputText}
                onChange={(e) => s.setDialogInputText(e.target.value)}
                placeholder={
                  type === 'add_tower' || type === 'rename_tower'
                    ? 'VD: Tòa S2.05, Tháp Diamond 1...'
                    : 'VD: Trục 08, Trục 05A, Trục 12...'
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-blue-600"
                autoFocus
              />
            </div>
          )}

          {type === 'move_units' && (
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dự Án Đích:</label>
                <select
                  value={s.dialogTargetProject}
                  onChange={(e) => {
                    s.setDialogTargetProject(e.target.value);
                    const proj = projects.find((p) => p.id === e.target.value);
                    s.setDialogTargetTower(proj?.towers?.[0] || '');
                  }}
                  className="w-full p-2 bg-slate-50 border rounded-xl font-medium"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tòa Tháp Đích:</label>
                <input
                  type="text"
                  value={s.dialogTargetTower}
                  onChange={(e) => s.setDialogTargetTower(e.target.value)}
                  placeholder="VD: Tòa S2.05"
                  className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Trục Căn Đích (Để trống nếu giữ nguyên trục cũ):
                </label>
                <input
                  type="text"
                  value={s.dialogTargetAxis}
                  onChange={(e) => s.setDialogTargetAxis(e.target.value)}
                  placeholder="VD: Trục 08"
                  className="w-full p-2 bg-slate-50 border rounded-xl"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-2 pt-3 border-t">
          <button
            type="button"
            onClick={() => s.setQuickActionModal({ isOpen: false, type: 'add_tower' })}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={s.handleDialogSubmit}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            Xác Nhận & Lưu Thay Đổi
          </button>
        </div>
      </div>
    </div>
  );
};
