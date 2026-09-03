import React, { useState } from 'react';
import { Lock, Eye, EyeOff, X, ShieldAlert, KeyRound, CheckCircle2 } from 'lucide-react';
import { verifyPassword, setAdminSession } from '../services/authService';
import { getStoredSettings } from '../services/storageService';
import { AppSettings } from '../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onLoginSuccess?: () => void;
  settings?: AppSettings;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onLoginSuccess,
  settings: propSettings,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentSettings = propSettings || getStoredSettings();

  const handleSuccessCallback = () => {
    if (onSuccess) onSuccess();
    if (onLoginSuccess) onLoginSuccess();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Vui lòng nhập mật khẩu quản trị.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // Simulate micro-delay
      await new Promise((r) => setTimeout(r, 200));

      const storedHash = currentSettings?.adminPasswordHash || '';
      const isValid = await verifyPassword(password, storedHash);

      if (isValid) {
        setAdminSession();
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setPassword('');
          handleSuccessCallback();
        }, 400);
      } else {
        setErrorMsg('Mật khẩu quản trị không chính xác. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('Lỗi xác thực. Vui lòng kiểm tra lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Khu Vực Quản Trị Hệ Thống</h3>
          <p className="text-xs text-slate-300 mt-1">
            Xác thực bảo mật dành riêng cho Kiến Trúc Sư & Quản Trị Viên
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2.5 text-red-700 text-xs sm:text-sm">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-2 text-emerald-800 text-xs sm:text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Đăng nhập thành công! Đang mở bảng điều khiển...</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Mật khẩu Admin
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Nhập mật khẩu quản trị..."
                autoFocus
                className="w-full pl-11 pr-11 py-3 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-700">Gợi ý bảo mật:</span> Mật khẩu mặc định là <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">admin123</code>. Bạn có thể đổi mật khẩu bất kỳ lúc nào trong tab Cài Đặt của trang Quản Trị.
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="px-5 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-indigo-900 active:scale-95 disabled:opacity-50 rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Đăng Nhập Quản Trị</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
