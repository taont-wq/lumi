/**
 * SettingsTab - Tab 3: Cấu hình Google Sheet & Hệ thống.
 * Tách riêng từ AdminPortal.tsx.
 */

import React, { useRef, useState } from 'react';
import {
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Lock,
  KeyRound,
  Database,
  Download,
  Upload,
  Save,
} from 'lucide-react';
import { AppSettings, LeadRecord, Project, ApartmentUnit } from '../../types';
import { sendLeadToGoogleSheet } from '../../services/storageService';
import { verifyPassword } from '../../services/authService';
import { updateAdminPassword } from '../../services/storageService';
import { exportSystemBackup, importSystemBackup, resetAllData } from '../../services/storageService';
import { GOOGLE_APPS_SCRIPT_CODE } from './googleAppsScript';
import { DialogApi } from '../admin/Modal';

interface SettingsTabProps {
  settings: AppSettings;
  projects: Project[];
  apartments: ApartmentUnit[];
  leads: LeadRecord[];
  onSaveSettings: (settings: AppSettings) => void;
  onRefreshAllData?: () => void;
  dialog?: DialogApi;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  projects,
  apartments,
  leads,
  onSaveSettings,
  onRefreshAllData,
  dialog,
}) => {
  // Fallback nếu SettingsTab được dùng ngoài <DialogHost> (vd: trong AdminPortal cũ)
  const dlg: DialogApi = dialog || {
    alert: async (t, m) => { window.alert(m ? `${t}\n\n${m}` : t); },
    confirm: async (t, m) => { return window.confirm(m ? `${t}\n\n${m}` : t); },
    info: async () => {},
  };

  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [webhookTestStatus, setWebhookTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>(
    'idle'
  );
  const [copiedScript, setCopiedScript] = useState(false);

  // Password
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Backup
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  const handleTestWebhook = async () => {
    if (!localSettings.googleSheetWebhookUrl) {
      await dlg.alert(
        'Thiếu cấu hình',
        'Vui lòng nhập Webhook URL của Google Apps Script trước!',
        'warning'
      );
      return;
    }
    setWebhookTestStatus('testing');
    try {
      const testLead: LeadRecord = {
        id: 'test-' + Date.now(),
        fullName: 'Khách Hàng Test',
        phoneNumber: '0988000000',
        projectId: 'test',
        projectName: 'Dự Án Thử Nghiệm',
        unitCode: 'TEST-01',
        unitType: '2PN',
        action: 'book_consult',
        actionName: 'Kiểm tra kết nối Webhook',
        note: 'Dữ liệu gửi thử từ bảng quản trị Admin',
        createdAt: new Date().toLocaleString('vi-VN'),
        status: 'new',
      };
      await sendLeadToGoogleSheet(testLead, localSettings.googleSheetWebhookUrl);
      setWebhookTestStatus('success');
      setTimeout(() => setWebhookTestStatus('idle'), 4000);
    } catch (e) {
      setWebhookTestStatus('error');
      setTimeout(() => setWebhookTestStatus('idle'), 4000);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE.trim());
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPasswordInput.trim()) {
      setPasswordChangeStatus({ type: 'error', message: 'Vui lòng nhập mật khẩu quản trị hiện tại.' });
      return;
    }
    if (newPasswordInput.length < 6) {
      setPasswordChangeStatus({
        type: 'error',
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự để đảm bảo an toàn.',
      });
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordChangeStatus({ type: 'error', message: 'Mật khẩu xác nhận không khớp với mật khẩu mới.' });
      return;
    }
    setIsChangingPassword(true);
    setPasswordChangeStatus({ type: 'idle', message: '' });
    try {
      const isCurrentValid = await verifyPassword(currentPasswordInput, settings.adminPasswordHash || '');
      if (!isCurrentValid) {
        setPasswordChangeStatus({ type: 'error', message: 'Mật khẩu hiện tại không chính xác.' });
        setIsChangingPassword(false);
        return;
      }
      const success = await updateAdminPassword(newPasswordInput);
      if (success) {
        setPasswordChangeStatus({
          type: 'success',
          message: 'Đã đổi mật khẩu quản trị thành công! Mật khẩu mới đã được mã hóa an toàn.',
        });
        setCurrentPasswordInput('');
        setNewPasswordInput('');
        setConfirmPasswordInput('');
      } else {
        setPasswordChangeStatus({ type: 'error', message: 'Không thể cập nhật mật khẩu. Vui lòng thử lại.' });
      }
    } catch (err) {
      setPasswordChangeStatus({ type: 'error', message: 'Đã xảy ra lỗi khi mã hóa và cập nhật mật khẩu.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const res = await importSystemBackup(text);
        if (res.success) {
          setImportStatus({ type: 'success', message: res.message });
          setTimeout(() => {
            if (onRefreshAllData) onRefreshAllData();
            else window.location.reload();
          }, 1000);
        } else {
          setImportStatus({ type: 'error', message: res.message });
        }
      } catch (err) {
        setImportStatus({ type: 'error', message: 'Lỗi đọc file sao lưu: ' + String(err) });
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Google Sheets Webhook Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Tích Hợp Tự Động Lưu Số Điện Thoại Vào Google Sheets
            </h3>
            <p className="text-xs text-slate-500">
              Khi khách hàng nhập SĐT để tải sơ đồ mặt bằng, thông tin sẽ được tự động đồng bộ ngay lập
              tức vào bảng tính Google Sheet của bạn.
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold text-slate-700">
            Google Apps Script Webhook URL:
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              value={localSettings.googleSheetWebhookUrl}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, googleSheetWebhookUrl: e.target.value })
              }
              className="w-full bg-slate-50 focus:bg-white text-xs sm:text-sm font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-200 px-3.5 py-2.5"
            />
            <button
              onClick={handleTestWebhook}
              disabled={webhookTestStatus === 'testing'}
              className="w-full sm:w-auto shrink-0 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${webhookTestStatus === 'testing' ? 'animate-spin' : ''}`}
              />
              <span>Gửi Thử Nghiệm</span>
            </button>
          </div>

          {webhookTestStatus === 'success' && (
            <p className="text-xs text-emerald-600 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đã gửi thử nghiệm thành công vào Google Sheet!</span>
            </p>
          )}
          {webhookTestStatus === 'error' && (
            <p className="text-xs text-red-600 font-bold flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>
                Không thể kết nối. Vui lòng kiểm tra lại quyền truy cập Apps Script ("Anyone / Bất kỳ ai").
              </span>
            </p>
          )}
        </div>

        {/* Step by step guide */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Hướng Dẫn Tạo Google Sheet Nhận Data (Chỉ 1 Phút):
            </span>
            <button
              onClick={handleCopyScript}
              className="inline-flex items-center space-x-1 px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedScript ? 'Đã Sao Chép!' : 'Sao Chép Mã Apps Script'}</span>
            </button>
          </div>

          <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-4 leading-relaxed">
            <li>Mở một Google Sheet mới trên Google Drive của bạn.</li>
            <li>
              Vào menu <strong>Tiện ích mở rộng (Extensions)</strong> &gt; <strong>Apps Script</strong>.
            </li>
            <li>Xóa toàn bộ mã cũ và dán mã bên dưới vào.</li>
            <li>
              Nhấn nút <strong>Triển khai (Deploy)</strong> &gt;{' '}
              <strong>Triển khai mới (New deployment)</strong>.
            </li>
            <li>
              Chọn loại: <strong>Ứng dụng web (Web app)</strong>.
            </li>
            <li>
              Mục <em>Ai có quyền truy cập (Who has access)</em> chọn:{' '}
              <strong>Bất kỳ ai (Anyone)</strong> &gt; Nhấn <strong>Triển khai (Deploy)</strong>.
            </li>
            <li>
              Sao chép <strong>URL ứng dụng web</strong> và dán vào ô Webhook URL ở trên rồi lưu lại!
            </li>
          </ol>
        </div>
      </div>

      {/* Security & Admin Password Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Bảo Mật & Đổi Mật Khẩu Quản Trị (Master Password)
            </h3>
            <p className="text-xs text-slate-500">
              Mật khẩu được mã hóa an toàn bằng thuật toán chuẩn SHA-256, chỉ những ai có mật khẩu mới
              có thể xem khách hàng và chỉnh sửa căn hộ.
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-3 pt-2">
          {passwordChangeStatus.message && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                passwordChangeStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {passwordChangeStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              )}
              <span>{passwordChangeStatus.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mật khẩu hiện tại:</label>
              <input
                type="password"
                placeholder="Mật khẩu cũ..."
                value={currentPasswordInput}
                onChange={(e) => setCurrentPasswordInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mật khẩu mới (tối thiểu 6 ký tự):
              </label>
              <input
                type="password"
                placeholder="Mật khẩu mới..."
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nhập lại mật khẩu mới:
              </label>
              <input
                type="password"
                placeholder="Xác nhận mật khẩu..."
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              Mật khẩu mặc định ban đầu:{' '}
              <code className="text-slate-700 font-mono">admin123</code>
            </span>
            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center space-x-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isChangingPassword ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Database Backup & Restore Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Sao Lưu & Phục Hồi Dữ Liệu Toàn Hệ Thống (JSON Backup)
            </h3>
            <p className="text-xs text-slate-500">
              Xuất file sao lưu đầy đủ tất cả căn hộ, sơ đồ kỹ thuật, hình ảnh 3D, video và danh sách
              khách hàng để lưu trữ an toàn hoặc chuyển sang máy khác.
            </p>
          </div>
        </div>

        {importStatus.message && (
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <Download className="w-4 h-4 text-blue-600" />
                <span>Xuất File Sao Lưu Hệ Thống (.JSON)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Bao gồm {projects.length} dự án, {apartments.length} căn hộ, {leads.length} khách hàng
                và toàn bộ cài đặt.
              </p>
            </div>
            <button
              type="button"
              onClick={exportSystemBackup}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải Xuống File Backup .JSON</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Nhập Khôi Phục Từ File Backup (.JSON)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Tải lên file JSON sao lưu đã xuất trước đó để khôi phục toàn bộ dữ liệu.
              </p>
            </div>
            <div>
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
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Chọn File JSON Để Khôi Phục</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Headline Settings */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Chữ Trang Chủ (Hero)</h3>
        <p className="text-xs text-slate-500">
          Tiêu đề và mô tả hiện ngay trên đầu trang chủ, phía trên bộ lọc tìm kiếm.
        </p>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Tiêu đề chính:</label>
          <input
            type="text"
            value={localSettings.heroHeadline}
            onChange={(e) => setLocalSettings({ ...localSettings, heroHeadline: e.target.value })}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả phụ:</label>
          <textarea
            rows={3}
            value={localSettings.heroSubheadline}
            onChange={(e) => setLocalSettings({ ...localSettings, heroSubheadline: e.target.value })}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
          />
        </div>
        <div className="pt-2 flex justify-end">
          <button
            onClick={async () => {
              onSaveSettings(localSettings);
              await dlg.alert('Thành công', 'Đã lưu chữ trang chủ!', 'success');
            }}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Chữ Trang Chủ</span>
          </button>
        </div>
      </div>

      {/* Brand Settings */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Thông Tin Liên Hệ & Thương Hiệu</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Thương Hiệu:</label>
            <input
              type="text"
              value={localSettings.brandName}
              onChange={(e) => setLocalSettings({ ...localSettings, brandName: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Số Hotline:</label>
            <input
              type="text"
              value={localSettings.hotline}
              onChange={(e) => setLocalSettings({ ...localSettings, hotline: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số Zalo Tư Vấn:
            </label>
            <input
              type="text"
              value={localSettings.zaloNumber}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  zaloNumber: e.target.value,
                  zaloLink: `https://zalo.me/${e.target.value.replace(/\s+/g, '')}`,
                })
              }
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Địa Chỉ Văn Phòng:
            </label>
            <input
              type="text"
              value={localSettings.address}
              onChange={(e) => setLocalSettings({ ...localSettings, address: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={async () => {
              const ok = await dlg.confirm(
                'Khởi tạo lại dữ liệu',
                'Bạn có chắc chắn muốn khởi tạo lại dữ liệu gốc của hệ thống? Tất cả dự án, căn hộ và khách hàng sẽ bị xoá và thay bằng dữ liệu mặc định. Hành động này KHÔNG thể hoàn tác.',
                { tone: 'error', confirmText: 'Khởi tạo lại' }
              );
              if (ok) {
                await resetAllData();
                window.location.reload();
              }
            }}
            className="text-xs text-red-600 hover:underline cursor-pointer"
          >
            Khởi tạo lại dữ liệu hệ thống
          </button>

          <button
            onClick={async () => {
              onSaveSettings(localSettings);
              await dlg.alert('Thành công', 'Đã lưu cài đặt thành công!', 'success');
            }}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Cài Đặt Hệ Thống</span>
          </button>
        </div>
      </div>
    </div>
  );
};
