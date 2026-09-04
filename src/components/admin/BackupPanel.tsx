/**
 * BackupPanel - Panel sao lưu / khôi phục dữ liệu hệ thống.
 *
 * Tách riêng từ SettingsTab để dễ thấy và có thể tái sử dụng.
 *
 * Chức năng:
 *   1. Xuất file sao lưu JSON toàn hệ thống (tên có timestamp)
 *   2. Nhập/khôi phục từ file JSON
 *   3. Xuất CSV riêng danh sách căn hộ (mở bằng Excel)
 *   4. Xuất CSV riêng danh sách khách hàng
 *   5. Xuất CSV riêng danh sách dự án
 *   6. Reset về dữ liệu mặc định (có confirm)
 */

import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Database,
  Building2,
  Home,
  Users,
  RotateCcw,
} from 'lucide-react';
import { ApartmentUnit, AppSettings, LeadRecord, Project } from '../../types';
import {
  exportSystemBackup,
  importSystemBackup,
  resetAllData,
  exportApartmentsToCsv,
  exportLeadsToCsv,
  exportProjectsToCsv,
} from '../../services/storageService';
import { DialogApi } from './Modal';

interface BackupPanelProps {
  projects: Project[];
  apartments: ApartmentUnit[];
  leads: LeadRecord[];
  settings: AppSettings;
  onRefreshAllData?: () => void;
  dialog?: DialogApi;
}

const timestamp = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
};

export const BackupPanel: React.FC<BackupPanelProps> = ({
  projects,
  apartments,
  leads,
  onRefreshAllData,
  dialog,
}) => {
  const dlg: DialogApi = dialog || {
    alert: async (t, m) => { window.alert(m ? `${t}\n\n${m}` : t); },
    confirm: async (t, m) => { return window.confirm(m ? `${t}\n\n${m}` : t); },
    info: async () => {},
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });
  const [isImporting, setIsImporting] = useState(false);

  // --- Export full JSON backup ---
  const handleExportFull = () => {
    exportSystemBackup();
    dlg.info(
      'Đã tải xuống file sao lưu',
      <div className="space-y-2">
        <p>
          File backup toàn hệ thống đã được tải xuống. File có tên{' '}
          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">lumi-backup-{timestamp()}.json</code>{' '}
          và chứa:
        </p>
        <ul className="list-disc pl-5 text-xs space-y-0.5">
          <li>{projects.length} dự án</li>
          <li>{apartments.length} căn hộ</li>
          <li>{leads.length} khách hàng</li>
          <li>Cấu hình hotline, Zalo, Google Sheets, banner...</li>
        </ul>
        <p className="text-amber-700 font-semibold">
          ⚠ Lưu file ở nơi an toàn (Google Drive, USB...) trước khi thay đổi lớn.
        </p>
      </div>
    );
  };

  // --- Export CSV từng bảng ---
  const handleExportApartmentsCsv = () => {
    if (apartments.length === 0) {
      dlg.alert('Không có dữ liệu', 'Chưa có căn hộ nào trong hệ thống để xuất.', 'warning');
      return;
    }
    exportApartmentsToCsv(apartments);
    dlg.alert(
      'Xuất CSV thành công',
      `Đã xuất ${apartments.length} căn hộ ra file CSV. Mở file bằng Microsoft Excel hoặc Google Sheets để xem/chỉnh sửa.`,
      'success'
    );
  };

  const handleExportLeadsCsv = () => {
    if (leads.length === 0) {
      dlg.alert('Không có dữ liệu', 'Chưa có khách hàng nào trong hệ thống để xuất.', 'warning');
      return;
    }
    exportLeadsToCsv(leads);
    dlg.alert(
      'Xuất CSV thành công',
      `Đã xuất ${leads.length} khách hàng ra file CSV. Mở file bằng Microsoft Excel hoặc Google Sheets để xem/chỉnh sửa.`,
      'success'
    );
  };

  const handleExportProjectsCsv = () => {
    if (projects.length === 0) {
      dlg.alert('Không có dữ liệu', 'Chưa có dự án nào trong hệ thống để xuất.', 'warning');
      return;
    }
    exportProjectsToCsv(projects);
    dlg.alert(
      'Xuất CSV thành công',
      `Đã xuất ${projects.length} dự án ra file CSV.`,
      'success'
    );
  };

  // --- Import JSON backup ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    setImportStatus({ type: 'idle', message: '' });
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const res = await importSystemBackup(text);
        if (res.success) {
          setImportStatus({ type: 'success', message: res.message });
          await dlg.alert('Khôi phục thành công', res.message, 'success');
          setTimeout(() => {
            if (onRefreshAllData) onRefreshAllData();
            else window.location.reload();
          }, 1000);
        } else {
          setImportStatus({ type: 'error', message: res.message });
          await dlg.alert('Khôi phục thất bại', res.message, 'error');
        }
      } catch (err) {
        const msg = 'Lỗi đọc file sao lưu: ' + String(err);
        setImportStatus({ type: 'error', message: msg });
        await dlg.alert('Lỗi đọc file', msg, 'error');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  // --- Reset ---
  const handleReset = async () => {
    const ok = await dlg.confirm(
      'Khởi tạo lại dữ liệu',
      'Toàn bộ dự án, căn hộ, khách hàng sẽ bị xoá và thay bằng dữ liệu mặc định ban đầu. Hành động này KHÔNG thể hoàn tác.\n\nBạn nên xuất file backup trước khi thực hiện.',
      { tone: 'error', confirmText: 'Xoá hết & Khởi tạo lại' }
    );
    if (ok) {
      await resetAllData();
      await dlg.alert('Đã khởi tạo lại', 'Hệ thống đã được đưa về trạng thái mặc định.', 'success');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4">
      {/* Card 1: Export / Import JSON (toàn hệ thống) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Database className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">Sao Lưu & Khôi Phục Toàn Bộ Hệ Thống</h3>
            <p className="text-xs text-slate-500">
              Xuất toàn bộ dữ liệu ra file JSON để sao lưu định kỳ. Có thể khôi phục bất cứ lúc nào từ file JSON đã lưu.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleExportFull}
            className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-sm cursor-pointer flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>📥 Xuất File Sao Lưu (.JSON)</span>
          </button>

          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-sm cursor-pointer flex items-center justify-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>{isImporting ? '⏳ Đang khôi phục...' : '📤 Nhập File Khôi Phục (.JSON)'}</span>
            </button>
          </div>
        </div>

        {importStatus.type !== 'idle' && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
              importStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {importStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}
      </div>

      {/* Card 2: Export CSV theo từng bảng */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Xuất Dữ Liệu Ra Excel / Google Sheets</h3>
            <p className="text-xs text-slate-500">
              Mở bằng Microsoft Excel, Google Sheets hoặc Numbers. Dùng để chỉnh sửa hàng loạt rồi nhập lại.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={handleExportApartmentsCsv}
            className="p-4 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl text-left transition-colors group"
          >
            <div className="flex items-center space-x-2 mb-1">
              <Home className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">Danh Sách Căn Hộ</span>
            </div>
            <p className="text-[11px] text-slate-500">{apartments.length} căn — đầy đủ thông số kỹ thuật</p>
            <div className="mt-2 text-[11px] text-emerald-700 font-bold group-hover:underline">
              Tải xuống .CSV →
            </div>
          </button>

          <button
            type="button"
            onClick={handleExportLeadsCsv}
            className="p-4 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl text-left transition-colors group"
          >
            <div className="flex items-center space-x-2 mb-1">
              <Users className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">Danh Sách Khách Hàng</span>
            </div>
            <p className="text-[11px] text-slate-500">{leads.length} khách — CRM chi tiết</p>
            <div className="mt-2 text-[11px] text-emerald-700 font-bold group-hover:underline">
              Tải xuống .CSV →
            </div>
          </button>

          <button
            type="button"
            onClick={handleExportProjectsCsv}
            className="p-4 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl text-left transition-colors group"
          >
            <div className="flex items-center space-x-2 mb-1">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">Danh Sách Dự Án</span>
            </div>
            <p className="text-[11px] text-slate-500">{projects.length} dự án — cây thư mục tổng quan</p>
            <div className="mt-2 text-[11px] text-emerald-700 font-bold group-hover:underline">
              Tải xuống .CSV →
            </div>
          </button>
        </div>
      </div>

      {/* Card 3: Vùng nguy hiểm - Reset */}
      <div className="bg-red-50/50 p-6 rounded-3xl border border-red-200 shadow-sm space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-red-900">Vùng Nguy Hiểm</h3>
            <p className="text-xs text-red-700">
              Hành động dưới đây sẽ xoá toàn bộ dữ liệu. Bạn nên xuất file backup trước.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-red-700 hover:text-white hover:bg-red-600 border border-red-300 hover:border-red-600 font-bold px-4 py-2 rounded-xl transition-colors"
        >
          ⚠ Khởi tạo lại dữ liệu hệ thống
        </button>
      </div>
    </div>
  );
};
