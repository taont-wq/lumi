/**
 * AdminDashboardPage - /admin
 *
 * Trang quản trị thay thế cho modal AdminPortal cũ.
 * - Layout: sidebar trái (tabs) + content phải
 * - Dùng React Router (nested route)
 * - Yêu cầu auth (RouteGuard wrap bên ngoài)
 *
 * Routes:
 *   /admin            → catalog (default)
 *   /admin/catalog    → cây thư mục
 *   /admin/leads      → CRM
 *   /admin/settings   → cấu hình
 */

import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LogOut,
  Users,
  Settings as SettingsIcon,
  FolderTree,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { ApartmentUnit, AppSettings, LeadRecord, Project } from '../types';
import { signOut } from '../lib/auth';
import { DialogHost, useDialog } from '../components/admin/Modal';

interface AdminDashboardPageProps {
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

const TABS = [
  { to: '/admin/catalog', label: 'Cây Thư Mục & Tra Cứu', icon: FolderTree },
  { to: '/admin/leads', label: 'Khách Hàng & CRM', icon: Users },
  { to: '/admin/settings', label: 'Google Sheets & Hệ Thống', icon: SettingsIcon },
];

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
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
  const navigate = useNavigate();
  const dialog = useDialog();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    const ok = await dialog.confirm('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi bảng quản trị?', {
      tone: 'warning',
      confirmText: 'Đăng xuất',
    });
    if (!ok) return;
    setLoggingOut(true);
    try {
      await signOut();
      navigate('/admin/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      await dialog.alert('Đăng xuất thất bại', String(err), 'error');
    } finally {
      setLoggingOut(false);
    }
  };

  const newLeadCount = leads.filter((l) => l.status === 'new').length;

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col">
        {/* Top Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-lg">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <img
              src="/logo-Lumi-05-1-300x106.png"
              alt="Lumi Design"
              className="h-7 sm:h-8 w-auto brightness-0 invert shrink-0"
            />
            <div className="hidden sm:block min-w-0">
              <h1 className="text-sm sm:text-base font-bold tracking-tight truncate">
                Bảng Quản Trị
              </h1>
              <p className="text-[11px] text-slate-400 truncate">
                tra-cuu.noithatlumi.vn
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              title="Xem trang công khai (mở tab mới)"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">Xem Trang</span>
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold text-red-300 hover:text-white bg-red-950/50 hover:bg-red-900 border border-red-800/50 rounded-lg transition-colors disabled:opacity-50"
              title="Đăng xuất"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">
                {loggingOut ? 'Đang xuất...' : 'Đăng Xuất'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-60 lg:w-64 bg-white border-r border-slate-200 flex-col shrink-0">
          <nav className="flex-1 p-3 space-y-1 sticky top-14 sm:top-16 self-start">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between space-x-2.5 px-3 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-blue-600' : 'text-slate-500'
                          }`}
                        />
                        <span className="truncate">{tab.label}</span>
                      </div>
                      {tab.to === '/admin/leads' && newLeadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold shrink-0">
                          {newLeadCount}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}

            <div className="pt-4 mt-4 border-t border-slate-200">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-50"
              >
                <span>Supabase Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </nav>

          {/* Footer info */}
          <div className="p-3 border-t border-slate-200 text-[10px] text-slate-400">
            <div className="flex items-center justify-between">
              <span>{projects.length} dự án</span>
              <span>{apartments.length} căn hộ</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span>{leads.length} khách hàng</span>
              <span className="text-emerald-600">{newLeadCount} mới</span>
            </div>
          </div>
        </aside>

        {/* Mobile tab bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-2 py-2 flex justify-around">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `flex flex-col items-center px-3 py-1 rounded-lg ${
                    isActive ? 'text-blue-600' : 'text-slate-500'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] mt-0.5 font-semibold">{tab.label.split(' ')[0]}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Main content area - nested routes render here */}
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6">
            <Outlet
              context={{
                projects,
                apartments,
                leads,
                settings,
                onSaveProjects,
                onSaveApartments,
                onSaveLeads,
                onSaveSettings,
                onRefreshAllData,
                dialog,
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

// Wrap bằng DialogHost để useDialog hoạt động trong toàn bộ admin tree
export const AdminDashboardPageWithDialog: React.FC<AdminDashboardPageProps> = (props) => (
  <DialogHost>
    <AdminDashboardPage {...props} />
  </DialogHost>
);
