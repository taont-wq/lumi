/**
 * LeadsTab - Tab 2: Khách hàng & CRM.
 * Tách riêng từ AdminPortal.tsx.
 */

import React, { useState } from 'react';
import {
  Download,
  Trash2,
  Phone,
  CheckCircle2,
  RefreshCw,
  Search,
  FileSpreadsheet,
} from 'lucide-react';
import { LeadRecord, AppSettings } from '../../types';
import {
  exportLeadsToCsv,
  sendLeadToGoogleSheet,
} from '../../services/storageService';
import { DialogApi } from '../admin/Modal';

interface LeadsTabProps {
  leads: LeadRecord[];
  settings: AppSettings;
  onSaveLeads: (leads: LeadRecord[]) => void;
  dialog?: DialogApi;
}

export const LeadsTab: React.FC<LeadsTabProps> = ({ leads, settings, onSaveLeads, dialog }) => {
  // Fallback nếu LeadsTab được dùng ngoài <DialogHost> (vd: trong AdminPortal cũ)
  const dlg: DialogApi = dialog || {
    alert: async (t, m) => { window.alert(m ? `${t}\n\n${m}` : t); },
    confirm: async (t, m) => { return window.confirm(m ? `${t}\n\n${m}` : t); },
    info: async () => {},
  };

  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('all');
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  const filteredLeads = leads.filter((l) => {
    const matchSearch =
      l.fullName.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.phoneNumber.includes(leadSearch) ||
      (l.unitCode && l.unitCode.toLowerCase().includes(leadSearch.toLowerCase())) ||
      (l.projectName && l.projectName.toLowerCase().includes(leadSearch.toLowerCase()));
    const matchStatus = leadStatusFilter === 'all' || l.status === leadStatusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpdateLeadStatus = (leadId: string, newStatus: LeadRecord['status']) => {
    onSaveLeads(leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
  };

  const handleDeleteLead = async (leadId: string) => {
    const ok = await dlg.confirm(
      'Xóa khách hàng',
      'Bạn có chắc chắn muốn xóa thông tin khách hàng này? Hành động này không thể hoàn tác.',
      { tone: 'warning', confirmText: 'Xóa' }
    );
    if (ok) {
      onSaveLeads(leads.filter((l) => l.id !== leadId));
    }
  };

  const handleSyncLeadNow = async (lead: LeadRecord) => {
    if (!settings.googleSheetWebhookUrl) {
      await dlg.alert(
        'Thiếu cấu hình Webhook',
        'Vui lòng vào tab Cấu Hình & Google Sheet để dán URL Webhook trước!',
        'warning'
      );
      return;
    }
    const res = await sendLeadToGoogleSheet(lead, settings.googleSheetWebhookUrl);
    if (res) {
      onSaveLeads(
        leads.map((l) => (l.id === lead.id ? { ...l, syncedToGoogleSheet: true } : l))
      );
      await dlg.alert('Thành công', 'Đã gửi thông tin khách vào Google Sheet thành công!', 'success');
    } else {
      await dlg.alert(
        'Gửi thất bại',
        'Không thể gửi đến Webhook Google Sheet. Vui lòng kiểm tra lại URL.',
        'error'
      );
    }
  };

  const handleSyncAllLeads = async () => {
    if (!settings.googleSheetWebhookUrl) {
      await dlg.alert(
        'Thiếu cấu hình Webhook',
        'Vui lòng cấu hình Webhook Google Sheet trước!',
        'warning'
      );
      return;
    }
    setIsSyncingAll(true);
    setSyncStatusMsg('Đang đồng bộ danh sách khách hàng sang Google Sheet...');

    let count = 0;
    const updatedLeads = [...leads];
    for (let i = 0; i < updatedLeads.length; i++) {
      const success = await sendLeadToGoogleSheet(updatedLeads[i], settings.googleSheetWebhookUrl);
      if (success) {
        updatedLeads[i] = { ...updatedLeads[i], syncedToGoogleSheet: true };
        count++;
      }
    }
    onSaveLeads(updatedLeads);
    setIsSyncingAll(false);
    setSyncStatusMsg(`Hoàn tất! Đã đồng bộ thành công ${count} khách hàng sang Google Sheet.`);
    setTimeout(() => setSyncStatusMsg(''), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Tìm SĐT, tên, mã căn..."
              value={leadSearch}
              onChange={(e) => setLeadSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <select
            value={leadStatusFilter}
            onChange={(e) => setLeadStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium"
          >
            <option value="all">Tất cả trạng thái ({leads.length})</option>
            <option value="new">Mới (Chưa gọi)</option>
            <option value="contacted">Đã liên hệ</option>
            <option value="consulting">Đang tư vấn</option>
            <option value="completed">Đã chốt / Hoàn tất</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={exportLeadsToCsv}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Xuất File Excel (CSV)</span>
          </button>

          <button
            onClick={handleSyncAllLeads}
            disabled={isSyncingAll}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>Đồng Bộ Google Sheet</span>
          </button>
        </div>
      </div>

      {/* Sync Status Alert */}
      {syncStatusMsg && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>{syncStatusMsg}</span>
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Thời Gian</th>
                <th className="py-3 px-4">Khách Hàng / SĐT</th>
                <th className="py-3 px-4">Mã Căn & Dự Án</th>
                <th className="py-3 px-4">Yêu Cầu / Hành Động</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4">Ghi Chú</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{lead.createdAt}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{lead.fullName}</div>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <a
                          href={`tel:${lead.phoneNumber}`}
                          className="text-blue-600 font-extrabold hover:underline flex items-center space-x-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{lead.phoneNumber}</span>
                        </a>
                        <a
                          href={`https://zalo.me/${lead.phoneNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold hover:bg-blue-200"
                        >
                          Zalo
                        </a>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">
                        {lead.unitCode || 'Chưa chọn'}
                      </span>
                      <span className="text-slate-500 text-[11px] block">{lead.projectName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold inline-block">
                        {lead.actionName || lead.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          handleUpdateLeadStatus(lead.id, e.target.value as LeadRecord['status'])
                        }
                        className={`text-[11px] font-bold rounded-lg px-2 py-1 border cursor-pointer ${
                          lead.status === 'new'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : lead.status === 'contacted'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : lead.status === 'consulting'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        <option value="new">Mới</option>
                        <option value="contacted">Đã gọi</option>
                        <option value="consulting">Đang tư vấn</option>
                        <option value="completed">Đã chốt</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={lead.note}>
                      {lead.note || '—'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => handleSyncLeadNow(lead)}
                        title="Đẩy sang Google Sheet"
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        title="Xóa"
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Không tìm thấy dữ liệu khách hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
