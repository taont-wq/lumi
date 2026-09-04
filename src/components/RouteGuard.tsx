/**
 * RouteGuard - bảo vệ các route cần auth (admin).
 *
 * Luồng:
 *   1. Check Supabase session
 *   2. Nếu chưa login → redirect tới /admin/login (lưu returnTo)
 *   3. Nếu đã login → render children
 *
 * Tích hợp với Supabase Auth (src/lib/auth.ts).
 */

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { getCurrentSession, onAuthStateChange } from '../lib/auth';
import { isSupabaseEnabled } from '../lib/supabase';

interface RouteGuardProps {
  children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Nếu Supabase chưa cấu hình, cho phép truy cập (fallback)
    if (!isSupabaseEnabled()) {
      setLoading(false);
      return;
    }

    // Lấy session ban đầu
    getCurrentSession().then((s) => {
      setSession(s);
      setLoading(false);
    });

    // Subscribe auth changes
    const unsubscribe = onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-600">Đang kiểm tra phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

  // Nếu Supabase chưa cấu hình (dev fallback), cho phép vào admin
  if (!isSupabaseEnabled()) {
    return <>{children}</>;
  }

  // Chưa đăng nhập → redirect tới /admin/login
  if (!session) {
    return <Navigate to="/admin/login" state={{ returnTo: location.pathname }} replace />;
  }

  return <>{children}</>;
};
