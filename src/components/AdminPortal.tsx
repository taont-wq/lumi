/**
 * AdminPortal - Shell component quản trị.
 *
 * Cấu trúc sau khi refactor (giảm từ 1.793 dòng xuống ~280 dòng):
 * - admin/LeadsTab.tsx: Tab 2 - CRM
 * - admin/SettingsTab.tsx: Tab 3 - Cấu hình Google Sheet & hệ thống
 * - admin/ApartmentEditorModal.tsx: Modal chỉnh sửa căn hộ
 * - admin/ProjectEditorModal.tsx: Modal chỉnh sửa dự án
 * - admin/googleAppsScript.ts: Mã Apps Script (constant)
 */

import React, { useState } from 'react';
import {
  X,
  Users,
  Building,
  Settings as SettingsIcon,
  Eye,
  LogOut,
  FileSpreadsheet,
  FolderTree,
} from 'lucide-react';
import { ApartmentUnit, AppSettings, LeadRecord, Project } from '../types';
import { CatalogTreeManager } from './CatalogTreeManager';
import { signOut } from '../lib/auth';
import { LeadsTab } from './admin/LeadsTab';
import { SettingsTab } from './admin/SettingsTab';
import { ApartmentEditorModal } from './admin/ApartmentEditorModal';
import { ProjectEditorModal } from './admin/ProjectEditorModal';
import { DialogHost, useDialog } from './admin/Modal';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
  projects: Project[];
  apartments: ApartmentUnit[];
  leads: LeadRecord[];
  settings: AppSettings;
  onSaveProjects: (projects: Project[]) => void;
  onSaveApartments: (apartments: ApartmentUnit[]) => void;
  onSaveLeads: (leads: LeadRecord[]) => void;
  onSaveSettings: (settings: AppSettings) => void;
  onRefreshAllData?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  onLogout,
  projects,
  apartments,
  leads,
  settings,
  onSaveProjects,
  onSaveApartments,
  onSaveLeads,
  onSaveSettings,
  onRefreshAllData,
}) => {
  if (!isOpen) return null;

  return <AdminPortalContent
    isOpen={isOpen}
    onClose={onClose}
    onLogout={onLogout}
    projects={projects}
    apartments={apartments}
    leads={leads}
    settings={settings}
    onSaveProjects={onSaveProjects}
    onSaveApartments={onSaveApartments}
    onSaveLeads={onSaveLeads}
    onSaveSettings={onSaveSettings}
    onRefreshAllData={onRefreshAllData}
  />;
};

/**
 * AdminPortalContent - phần thân, có thể dùng hook useDialog (cần nằm trong <DialogHost>).
 */
const AdminPortalContent: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  onLogout,
  projects,
  apartments,
  leads,
  settings,
  onSaveProjects,
  onSaveApartments,
  onSaveLeads,
  onSaveSettings,
  onRefreshAllData,
}) => {
  const dialog = useDialog();
  const [activeTab, setActiveTab] = useState<'catalog' | 'leads' | 'settings'>('catalog');
  const [selectedApartmentForEdit, setSelectedApartmentForEdit] = useState<ApartmentUnit | null>(null);
  const [isEditingApartment, setIsEditingApartment] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<Project | null>(null);

  if (!isOpen) return null;

      const handleLogoutAdmin = async () => {
        const ok = await dialog.confirm(
          'Đăng xuất',
          'Bạn có chắc chắn muốn đăng xuất khỏi khu vực Quản Trị?',
          { tone: 'warning', confirmText: 'Đăng xuất' }
        );
        if (ok) {
          await signOut();
          if (onLogout) onLogout();
          else onClose();
        }
      };

  return (
    <DialogHost>
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-7xl w-full max-h-[96vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Admin Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Bảng Quản Trị Hệ Thống Căn Hộ & Khách Hàng
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  KTS Authenticated
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Chỉnh sửa kích thước căn hộ, sơ đồ mặt bằng, hình ảnh 3D, video & quản lý số điện thoại
                khách hàng
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-center">
            <button
              onClick={onClose}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Xem giao diện người dùng"
            >
              <Eye className="w-4 h-4 text-blue-400" />
              <span>Xem Website</span>
            </button>
            <button
              onClick={handleLogoutAdmin}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-red-300 hover:text-white bg-red-950/50 hover:bg-red-900 border border-red-800/50 rounded-lg transition-colors cursor-pointer"
              title="Đăng xuất khỏi tài khoản quản trị"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Đăng Xuất</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Đóng bảng quản trị"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-slate-100/80 flex space-x-2 sm:space-x-4 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'catalog'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>
              Cây Thư Mục & Tra Cứu ({apartments.length} căn • {projects.length} dự án)
            </span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'leads'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Khách Hàng & CRM ({leads.length})</span>
            {leads.filter((l) => l.status === 'new').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px]">
                {leads.filter((l) => l.status === 'new').length} mới
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Google Sheets & Hệ Thống</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-6">
          {activeTab === 'catalog' && (
            <CatalogTreeManager
              projects={projects}
              apartments={apartments}
              onSaveProjects={onSaveProjects}
              onSaveApartments={onSaveApartments}
              onOpenApartmentEditor={(apt) => {
                setSelectedApartmentForEdit(apt);
                setIsEditingApartment(true);
              }}
              onOpenProjectEditor={(proj) => {
                setSelectedProjectForEdit(proj);
                setIsEditingProject(true);
              }}
              onAddNewApartmentWithDefaults={(defaults) => {
                const projId = defaults.projectId || projects[0]?.id || 'proj-1';
                const proj = projects.find((p) => p.id === projId);
                const newApt: ApartmentUnit = {
                  id: 'apt-' + Date.now(),
                  projectId: projId,
                  projectName: proj?.name || 'Dự án',
                  unitCode: defaults.unitCode || 'Căn Mới ' + (apartments.length + 1),
                  axisNumber: defaults.axisNumber || 'Trục 08',
                  unitType: '2pn_2wc',
                  unitTypeName: '2 Phòng Ngủ + 2WC',
                  tower: defaults.tower || proj?.towers?.[0] || 'Tòa Tháp A',
                  grossArea: 70,
                  netArea: 65,
                  ceilingHeight: 2.85,
                  direction: 'Ban công Đông Nam mát mẻ',
                  floorPlanImageUrl:
                    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
                  description: 'Mô tả không gian và ưu điểm căn hộ...',
                  highlights: [
                    'Thiết kế hiện đại vuông vức',
                    'Phòng khách kết nối ban công thoáng đãng',
                  ],
                  roomDimensions: [
                    { id: 'r1', name: 'Phòng Khách + Bếp', width: 3.5, length: 5.5, area: 19.2 },
                    { id: 'r2', name: 'Phòng Ngủ Master', width: 3.4, length: 4.0, area: 13.6 },
                    { id: 'r3', name: 'Phòng Ngủ 2', width: 3.0, length: 3.5, area: 10.5 },
                    { id: 'r4', name: 'WC 1', width: 1.6, length: 2.3, area: 3.7 },
                    { id: 'r5', name: 'Ban Công', width: 1.2, length: 3.2, area: 3.8 },
                  ],
                  interiorImages: [
                    {
                      id: 'img-new-1',
                      title: 'Phòng Khách Hiện Đại',
                      style: 'modern',
                      styleName: 'Hiện Đại',
                      url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
                      roomType: 'living',
                      roomTypeName: 'Phòng Khách',
                    },
                  ],
                  videos: [],
                  estimatedCostRange: {
                    basic: '100.000.000đ - 130.000.000đ',
                    standard: '160.000.000đ - 210.000.000đ',
                    premium: '250.000.000đ - 350.000.000đ',
                  },
                };
                setSelectedApartmentForEdit(newApt);
                setIsEditingApartment(true);
              }}
              dialog={dialog}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsTab leads={leads} settings={settings} onSaveLeads={onSaveLeads} dialog={dialog} />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              settings={settings}
              projects={projects}
              apartments={apartments}
              leads={leads}
              onSaveSettings={onSaveSettings}
              onRefreshAllData={onRefreshAllData}
              dialog={dialog}
            />
          )}
        </div>
      </div>

      {/* Apartment Editor Modal */}
      {isEditingApartment && selectedApartmentForEdit && (
        <ApartmentEditorModal
          apartment={selectedApartmentForEdit}
          projects={projects}
          onClose={() => {
            setIsEditingApartment(false);
            setSelectedApartmentForEdit(null);
          }}
          onSave={(apt) => {
            const exists = apartments.some((a) => a.id === apt.id);
            const updated = exists
              ? apartments.map((a) => (a.id === apt.id ? apt : a))
              : [apt, ...apartments];
            onSaveApartments(updated);
            setIsEditingApartment(false);
            setSelectedApartmentForEdit(null);
          }}
        />
      )}

      {/* Project Editor Modal */}
      {isEditingProject && selectedProjectForEdit && (
        <ProjectEditorModal
          project={selectedProjectForEdit}
          onClose={() => {
            setIsEditingProject(false);
            setSelectedProjectForEdit(null);
          }}
          onSave={(proj) => {
            const exists = projects.some((p) => p.id === proj.id);
            const updated = exists
              ? projects.map((p) => (p.id === proj.id ? proj : p))
              : [proj, ...projects];
            onSaveProjects(updated);
            setIsEditingProject(false);
            setSelectedProjectForEdit(null);
          }}
        />
      )}
    </div>
    </DialogHost>
  );
};
