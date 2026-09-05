/**
 * AdminCatalogPage - /admin/catalog
 *
 * Tab 1: Quản lý cây thư mục (Dự án → Toà → Tầng → Căn hộ) + Tra cứu
 * Tách logic từ AdminPortal cũ sang page riêng.
 *
 * Sau khi thêm/sửa căn → hiện toast thông báo + auto-navigate về project
 * của căn vừa thêm để user thấy ngay căn mới.
 */

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CheckCircle2, X } from 'lucide-react';
import { CatalogTreeManager } from '../components/CatalogTreeManager';
import { ApartmentEditorModal } from '../components/admin/ApartmentEditorModal';
import { ProjectEditorModal } from '../components/admin/ProjectEditorModal';
import { ApartmentUnit, AppSettings, LeadRecord, Project } from '../types';

interface OutletCtx {
  projects: Project[];
  apartments: ApartmentUnit[];
  leads: LeadRecord[];
  settings: AppSettings;
  onSaveProjects: (p: Project[]) => void;
  onSaveApartments: (a: ApartmentUnit[]) => void;
  onSaveLeads: (l: LeadRecord[]) => void;
  onSaveSettings: (s: AppSettings) => void;
  onRefreshAllData?: () => void;
  dialog?: import('../components/admin/Modal').DialogApi;
}

export const AdminCatalogPage: React.FC = () => {
  const ctx = useOutletContext<OutletCtx>();

  // Editor state
  const [editingApartment, setEditingApartment] = useState<ApartmentUnit | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Re-trigger CatalogTreeManager remount bằng key prop → reset selectedNode về root
  // → đảm bảo căn mới luôn hiển thị
  const [treeKey, setTreeKey] = useState(0);
  const resetTreeView = () => setTreeKey((k) => k + 1);

  return (
    <div className="space-y-6 relative">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Cây Thư Mục & Tra Cứu</h2>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý dự án, toà nhà, tầng, căn hộ và bảng giá.
        </p>
      </div>

      <CatalogTreeManager
        key={treeKey}
        projects={ctx.projects}
        apartments={ctx.apartments}
        settings={ctx.settings}
        onSaveProjects={ctx.onSaveProjects}
        onSaveApartments={ctx.onSaveApartments}
        onOpenApartmentEditor={setEditingApartment}
        onOpenProjectEditor={setEditingProject}
        dialog={ctx.dialog}
      />

      {/* Apartment editor */}
      {editingApartment && (
        <ApartmentEditorModal
          apartment={editingApartment}
          projects={ctx.projects}
          onClose={() => setEditingApartment(null)}
          onSave={(apt) => {
            const exists = ctx.apartments.some((a) => a.id === apt.id);
            const updated = exists
              ? ctx.apartments.map((a) => (a.id === apt.id ? apt : a))
              : [apt, ...ctx.apartments];
            ctx.onSaveApartments(updated);
            setEditingApartment(null);
            showToast(
              exists
                ? `Đã cập nhật căn ${apt.unitCode} thành công`
                : `Đã thêm căn mới "${apt.unitCode}" vào dự án ${apt.projectName}`,
              'success'
            );
            // Reset selectedNode để căn mới hiện ngay trong bảng
            resetTreeView();
          }}
        />
      )}

      {/* Project editor */}
      {editingProject && (
        <ProjectEditorModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSave={(proj) => {
            const exists = ctx.projects.some((p) => p.id === proj.id);
            const updated = exists
              ? ctx.projects.map((p) => (p.id === proj.id ? proj : p))
              : [proj, ...ctx.projects];
            ctx.onSaveProjects(updated);
            setEditingProject(null);
            showToast(
              exists
                ? `Đã cập nhật dự án ${proj.name}`
                : `Đã thêm dự án mới "${proj.name}"`,
              'success'
            );
            resetTreeView();
          }}
        />
      )}

      {/* Toast thông báo */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[100] flex items-center space-x-2 px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold animate-in fade-in slide-in-from-bottom-4 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toast.text}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 p-0.5 rounded hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
