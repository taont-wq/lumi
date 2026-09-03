import React from 'react';
import { Building2, Phone, MessageSquare, MapPin, Mail, ShieldCheck, Heart } from 'lucide-react';
import { AppSettings } from '../types';

interface FooterProps {
  settings: AppSettings;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenAdmin }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-20 sm:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Building2 className="w-6 h-6" />
              </div>
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
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${settings.hotline.replace(/\s+/g, '')}`} className="hover:text-white font-bold">
                  Hotline: {settings.hotline}
                </a>
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
                  <span>{settings.email}</span>
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

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} {settings.brandName}. Chuẩn dữ liệu kỹ thuật căn hộ.</p>
          <div className="flex items-center space-x-4">
            <span>Dành riêng cho cư dân chung cư</span>
            {/* Subtle discreet admin access */}
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center space-x-1 text-slate-600 hover:text-slate-400 transition-colors cursor-pointer py-1 px-1.5 rounded hover:bg-slate-800"
              title="Quản trị hệ thống (Kiến Trúc Sư)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[11px]">KTS / Admin</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
