/**
 * AdminLoginPage - /admin/login
 *
 * Form đăng nhập bằng Supabase Auth (email + password).
 * Sau khi login thành công → redirect về returnTo hoặc /admin.
 */

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { signInWithPassword } from '../lib/auth';
import { isSupabaseEnabled } from '../lib/supabase';

interface LocationState {
  returnTo?: string;
}

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as LocationState)?.returnTo || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithPassword(email, password);
      // Login thành công → redirect
      navigate(returnTo, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center space-x-1 text-sm text-slate-600 hover:text-blue-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 space-y-6">
          {/* Logo + Title */}
          <div className="text-center space-y-2">
            <img
              src="/logo-Lumi-05-1-300x106.png"
              alt="Lumi Design"
              className="h-10 mx-auto"
            />
            <h1 className="text-xl font-bold text-slate-900">Đăng Nhập Quản Trị</h1>
            <p className="text-xs text-slate-500">
              Khu vực dành riêng cho Kiến trúc sư / Admin Lumi Design
            </p>
          </div>

          {/* Supabase warning */}
          {!isSupabaseEnabled() && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong>Supabase chưa cấu hình.</strong> Thêm{' '}
                <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> và{' '}
                <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> vào file{' '}
                <code className="bg-amber-100 px-1 rounded">.env</code> để kích hoạt.
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@noithatlumi.vn"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <span>Đăng Nhập</span>
              )}
            </button>
          </form>

          {/* Help */}
          <div className="text-center text-[11px] text-slate-400 space-y-1">
            <p>Quên mật khẩu? Liên hệ super admin để reset.</p>
            <p>
              Mặc định dev: <code className="bg-slate-100 px-1.5 py-0.5 rounded">admin123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
