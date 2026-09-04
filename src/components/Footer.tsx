import React from 'react';
import { Phone, MessageSquare, MapPin, Mail, ShieldCheck, Heart } from 'lucide-react';
import { AppSettings } from '../types';

interface FooterProps {
  settings: AppSettings;
  isAdminAuthenticated: boolean;
  onOpenAdmin: () => void;
}

// An toàn: nút admin ở Footer chỉ hiện khi user đã authenticated.
// Truy cập admin công khai qua 2 cách ẩn:
//   1. Nhấn Ctrl+Shift+A trên bàn phím
//   2. Truy cập URL https://tra-cuu.noithatlumi.vn/#admin
// Mật khẩu mặc định "admin123" - đã cảnh báo user đổi trong Settings.

export const Footer: React.FC<FooterProps> = ({ settings, isAdminAuthenticated, onOpenAdmin }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-20 sm:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="/logo-Lumi-05-1-300x106.png"
                alt="Lumi Design - Kiến trúc & Nội thất"
                className="h-11 w-auto brightness-0 invert"
              />
              <span className="text-xl font-bold text-white tracking-tight">
                {settings.brandName}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              {settings.slogan ||
                'Nền tảng tra cứu kích thước chi tiết căn hộ, sơ đồ mặt bằng kỹ thuật, mẫu nội thất 3D và video thực tế giúp gia chủ tối ưu không gian sống.'}
            </p>
            <div className="flex items-center space-x-3 text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Bản vẽ kỹ thuật chuẩn 100%</span>
              </span>
              <span>•</span>
              <span>Hỗ trợ đo đạc tận nơi</span>
            </div>
          </div>

          {/* Contact Col */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              Thông Tin Liên Hệ
            </h4>
            <ul className="space-y-2.5">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Showroom:</div>
                  <div>{settings.addressShowroom || settings.address}</div>
                  {settings.addressVpgd && settings.addressVpgd.length > 0 && (
                    <div className="mt-1.5">
                      <div className="font-semibold text-white">Văn phòng:</div>
                      {settings.addressVpgd.map((vpgd, idx) => (
                        <div key={idx}>• {vpgd}</div>
                      ))}
                    </div>
                  )}
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <a
                    href={`tel:${settings.hotline.replace(/\s+/g, '')}`}
                    className="hover:text-white font-bold block"
                  >
                    Hotline: {settings.hotline}
                  </a>
                  {settings.hotline2 && (
                    <a
                      href={`tel:${settings.hotline2.replace(/\s+/g, '')}`}
                      className="hover:text-white font-bold block"
                    >
                      {settings.hotline2}
                    </a>
                  )}
                </div>
              </li>
              <li className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-blue-400 shrink-0" />
                <a
                  href={settings.zaloLink || `https://zalo.me/${settings.zaloNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  Zalo KTS: {settings.zaloNumber}
                </a>
              </li>
              {settings.email && (
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-white break-all"
                  >
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.facebookUrl && (
                <li className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    Facebook: fb.com/noithatlumidesign
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Quick Links & Info */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              Dịch Vụ & Hỗ Trợ
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>Tra cứu sơ đồ 2D & kích thước chi tiết</li>
              <li>Thư viện mẫu 3D Modern, Japandi & Luxury</li>
              <li>Video hiện trạng bàn giao thực tế</li>
              <li>Dự toán vật liệu An Cường & Hafele</li>
              <li>Tư vấn thiết kế & bóc tách khối lượng</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} {settings.brandName} · Một sản phẩm của <a href="https://noithatlumi.vn" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 font-semibold">noithatlumi.vn</a></p>
          <div className="flex items-center space-x-4">
            <a
              href="https://noithatlumi.vn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-amber-400 hover:text-amber-300 font-semibold transition-colors"
            >
              <span>← Về trang chủ Lumi Design</span>
            </a>
            <span className="hidden sm:inline">Dành riêng cho cư dân chung cư</span>
            {/* Subtle discreet admin access - chỉ hiện khi đã authenticated */}
            {isAdminAuthenticated && (
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center space-x-1 text-slate-600 hover:text-slate-400 transition-colors cursor-pointer py-1 px-1.5 rounded hover:bg-slate-800"
                title="Quản trị hệ thống (Kiến Trúc Sư)"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[11px]">KTS / Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
