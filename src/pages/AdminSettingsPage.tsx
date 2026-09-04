/**
 * AdminSettingsPage - /admin/settings
 *
 * Tab 3: Cấu hình hệ thống (Google Sheets, hotline, Zalo, banner) + đồng bộ dữ liệu.
 * Layout:
 *   [1] BackupPanel       — Sao lưu / Khôi phục / Export CSV  (dễ thấy nhất)
 *   [2] SettingsTab       — Cấu hình Google Sheet, hotline, Zalo, đổi mật khẩu
 */

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { SettingsTab } from '../components/admin/SettingsTab';
import { BackupPanel } from '../components/admin/BackupPanel';
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

export const AdminSettingsPage: React.FC = () => {
  const ctx = useOutletContext<OutletCtx>();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Sao Lưu & Cấu Hình Hệ Thống</h2>
        <p className="text-sm text-slate-500 mt-1">
          Xuất/nhập dữ liệu, đồng bộ Google Sheets, cấu hình hotline, Zalo và đổi mật khẩu admin.
        </p>
      </div>

      {/* [1] Backup/Restore/Export CSV */}
      <BackupPanel
        projects={ctx.projects}
        apartments={ctx.apartments}
        leads={ctx.leads}
        settings={ctx.settings}
        onRefreshAllData={ctx.onRefreshAllData}
        dialog={ctx.dialog}
      />

      {/* [2] Cấu hình hệ thống (Google Sheet, hotline, Zalo, mật khẩu) */}
      <SettingsTab
        settings={ctx.settings}
        projects={ctx.projects}
        apartments={ctx.apartments}
        leads={ctx.leads}
        onSaveSettings={ctx.onSaveSettings}
        onRefreshAllData={ctx.onRefreshAllData}
        dialog={ctx.dialog}
      />
    </div>
  );
};
