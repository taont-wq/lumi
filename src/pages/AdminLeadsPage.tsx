/**
 * AdminLeadsPage - /admin/leads
 *
 * Tab 2: CRM khách hàng - danh sách leads, lọc, đổi trạng thái, đồng bộ Google Sheets.
 */

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { LeadsTab } from '../components/admin/LeadsTab';
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

export const AdminLeadsPage: React.FC = () => {
  const ctx = useOutletContext<OutletCtx>();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Khách Hàng & CRM</h2>
        <p className="text-sm text-slate-500 mt-1">
          Theo dõi, phân loại, cập nhật trạng thái và đồng bộ khách hàng với Google Sheets.
        </p>
      </div>
      <LeadsTab
        leads={ctx.leads}
        settings={ctx.settings}
        onSaveLeads={ctx.onSaveLeads}
        dialog={ctx.dialog}
      />
    </div>
  );
};
