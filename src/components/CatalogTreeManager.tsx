/**
 * CatalogTreeManager - shell component.
 *
 * Cấu trúc sau khi refactor (giảm từ 1.808 dòng xuống ~150 dòng):
 * - useCatalogState.ts: tất cả state + handlers
 * - TreeView.tsx: cây thư mục tương tác
 * - MatrixView.tsx: bảng ma trận tra cứu
 * - QuickActionModal.tsx: dialog thao tác nhanh
 * - types.ts: shared types
 */

import React, { useState } from 'react';
import { FolderTree, Table as TableIcon, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { ApartmentUnit, AppSettings, Project } from '../types';
import { useCatalogState } from './catalog/useCatalogState';
import { TreeView } from './catalog/TreeView';
import { MatrixView } from './catalog/MatrixView';
import { QuickActionModal } from './catalog/QuickActionModal';
import { DialogApi } from './admin/Modal';

interface CatalogTreeManagerProps {
  projects: Project[];
  apartments: ApartmentUnit[];
  settings: AppSettings;
  onSaveProjects: (projects: Project[]) => void;
  onSaveApartments: (apartments: ApartmentUnit[]) => void;
  onOpenApartmentEditor: (apt: ApartmentUnit) => void;
  onOpenProjectEditor: (project: Project) => void;
  onAddNewApartmentWithDefaults?: (defaults: Partial<ApartmentUnit>) => void;
  dialog?: DialogApi;
}

export const CatalogTreeManager: React.FC<CatalogTreeManagerProps> = (props) => {
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const state = useCatalogState(
    props.projects,
    props.apartments,
    props.onSaveProjects,
    props.onSaveApartments,
    props.onOpenApartmentEditor,
    props.onAddNewApartmentWithDefaults,
    showToast,
    props.dialog
  );

  const newProject = (): Project => ({
    id: 'proj-' + Date.now(),
    name: 'Dự Án Mới',
    slug: 'du-an-moi-' + Date.now(),
    location: 'Hà Nội / TP.HCM',
    developer: 'Chủ đầu tư',
    bannerUrl:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80',
    towers: ['Tòa Tháp A', 'Tòa Tháp B'],
    availableUnitTypes: ['studio', '1pn', '2pn_2wc', '3pn'],
  });

  return (
    <div className="space-y-4">
      {/* Toast message */}
      {toastMsg && (
        <div
          className={`fixed top-5 right-5 z-70 px-4 py-3 rounded-2xl shadow-xl border flex items-center space-x-2 text-xs font-bold animate-fade-in ${
            toastMsg.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-red-600 text-white border-red-500'
          }`}
        >
          {toastMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Top Header Bar & Mode Switcher */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <span>Cây Thư Mục & Tra Cứu Căn Hộ</span>
              <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                {props.apartments.length} căn • {props.projects.length} dự án
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Quản trị phân cấp: Dự án ➜ Tòa tháp ➜ Trục căn ➜ Mặt bằng & Kích thước chi tiết
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => state.setViewMode('tree')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer ${
                state.viewMode === 'tree'
                  ? 'bg-white text-blue-700 shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Cây Thư Mục</span>
            </button>
            <button
              onClick={() => state.setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer ${
                state.viewMode === 'matrix'
                  ? 'bg-white text-blue-700 shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Bảng Ma Trận Tra Cứu</span>
            </button>
          </div>

          <button
            onClick={() => state.handleTriggerAddUnit(state.activeContext.defaultNewUnit)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs cursor-pointer"
            title="Thêm căn hộ mới (dùng vị trí đang chọn trong cây thư mục)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Căn Hộ</span>
          </button>
          <button
            onClick={() => props.onOpenProjectEditor(newProject())}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Dự Án</span>
          </button>
        </div>
      </div>

      {/* Active view */}
      {state.viewMode === 'tree' ? (
        <TreeView
          projects={props.projects}
          apartments={props.apartments}
          state={state}
          onOpenApartmentEditor={props.onOpenApartmentEditor}
          onOpenProjectEditor={props.onOpenProjectEditor}
          dialog={props.dialog}
        />
      ) : (
        <MatrixView
          projects={props.projects}
          apartments={props.apartments}
          settings={props.settings}
          state={state}
          onOpenApartmentEditor={props.onOpenApartmentEditor}
        />
      )}

      {/* Quick action dialog */}
      <QuickActionModal state={state} projects={props.projects} />
    </div>
  );
};
