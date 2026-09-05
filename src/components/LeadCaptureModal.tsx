import React, { useState } from 'react';
import {
  X,
  Download,
  Phone,
  User,
  MessageSquare,
  CheckCircle,
  FileCheck,
  Lock,
  ArrowRight,
  Sparkles,
  Building,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ApartmentUnit, AppSettings } from '../types';
import { submitLeadToGoogleForm } from '../services/googleFormLead';
import { addLead } from '../services/supabaseStorage';
import { getLeadSource } from '../lib/unitShare';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  apartment: ApartmentUnit | null;
  actionType: 'download_blueprint' | 'download_catalogue' | 'request_quotation' | 'book_consult';
  settings: AppSettings;
  onLeadSubmitted: () => void;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  isOpen,
  onClose,
  apartment,
  actionType,
  settings,
  onLeadSubmitted,
}) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [note, setNote] = useState('');
  const [needZaloConsult, setNeedZaloConsult] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const getActionTitle = () => {
    switch (actionType) {
      case 'download_blueprint':
        return 'Tải Sơ Đồ Mặt Bằng Kỹ Thuật (PDF/CAD)';
      case 'download_catalogue':
        return 'Tải Trọn Bộ 500+ Mẫu Thiết Kế 3D';
      case 'request_quotation':
        return 'Nhận Báo Giá Dự Toán Thi Công Chi Tiết';
      case 'book_consult':
        return 'Đăng Ký Tư Vấn Thiết Kế & Đo Đạc Miễn Phí';
      default:
        return 'Nhận Tài Liệu Căn Hộ Miễn Phí';
    }
  };

  const getActionSubtitle = () => {
    switch (actionType) {
      case 'download_blueprint':
        return 'Vui lòng nhập số điện thoại để hệ thống gửi link tải bản vẽ kỹ thuật chi tiết kích thước từng phòng & kết cấu điện nước.';
      case 'download_catalogue':
        return 'Nhập số điện thoại để nhận file tổng hợp mẫu 3D các phong cách Hiện Đại, Japandi, Indochine chất lượng cao.';
      case 'request_quotation':
        return 'Nhập thông tin để KTS lập bảng bóc tách khối lượng và báo giá chi tiết theo đúng mã căn của bạn.';
      default:
        return 'KTS sẽ liên hệ hỗ trợ gửi tài liệu và tư vấn giải pháp tối ưu không gian miễn phí 100%.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Basic VN Phone validation
    const cleanPhone = phoneNumber.trim().replace(/[\s.-]/g, '');
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;

    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      setErrorMessage('Vui lòng nhập số điện thoại hợp lệ (10 số, ví dụ: 0912345678)');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullNote = [
        needZaloConsult ? '[Cần KTS gửi qua Zalo]' : '',
        note.trim(),
      ]
        .filter(Boolean)
        .join(' - ');

      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const newLead = {
        id: crypto.randomUUID(),
        fullName: fullName.trim() || 'Khách hàng',
        phoneNumber: cleanPhone,
        projectId: apartment?.projectId || 'all',
        projectName: apartment?.projectName || 'Chung cư',
        unitCode: apartment?.unitCode || 'Không rõ',
        unitType: apartment?.unitTypeName || '',
        action: actionType,
        actionName: getActionTitle(),
        note: fullNote,
        createdAt: formattedDate,
        status: 'new' as const,
        syncedToGoogleSheet: false,
        source: getLeadSource() || undefined,
      };
      await addLead(newLead);
      await submitLeadToGoogleForm({
        fullName: newLead.fullName,
        phoneNumber: newLead.phoneNumber,
        email: null,
        projectName: newLead.projectName,
        unitCode: newLead.unitCode,
        unitType: newLead.unitType,
        action: newLead.action,
        actionName: newLead.actionName,
        note: newLead.note,
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      onLeadSubmitted();

      // Trigger Confetti effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    } catch (error) {
      setIsSubmitting(false);
      setErrorMessage('Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại hoặc gọi Hotline!');
    }
  };

  const handleDownloadDirect = () => {
    // Generate a mock or real download of blueprint technical spec sheet
    const content = `
THÔNG TIN KỸ THUẬT MẶT BẰNG CĂN HỘ
=====================================
Dự Án: ${apartment?.projectName || 'Chung cư'}
Mã Căn: ${apartment?.unitCode || 'Căn hộ'}
Loại Căn: ${apartment?.unitTypeName || ''}
Tòa: ${apartment?.tower || ''}
Diện tích tim tường: ${apartment?.grossArea || 0} m2
Diện tích thông thủy: ${apartment?.netArea || 0} m2
Chiều cao trần: ${apartment?.ceilingHeight || 2.85} m
Hướng cửa & ban công: ${apartment?.direction || ''}

BẢNG KÍCH THƯỚC CHI TIẾT TỪNG PHÒNG:
-------------------------------------
${(apartment?.roomDimensions || [])
  .map(
    (r, i) =>
      `${i + 1}. ${r.name}: Dài ${r.length}m x Rộng ${r.width}m = ${r.area} m2 (Trần cao: ${r.ceilingHeight || apartment?.ceilingHeight || 2.85}m)`
  )
  .join('\n')}

GỢI Ý DỰ TOÁN NỘI THẤT:
-------------------------------------
- Gói Cơ Bản: ${apartment?.estimatedCostRange?.basic || 'Từ 85 - 130 triệu'}
- Gói Tiêu Chuẩn: ${apartment?.estimatedCostRange?.standard || 'Từ 150 - 220 triệu'}
- Gói Cao Cấp: ${apartment?.estimatedCostRange?.premium || 'Từ 250 - 380 triệu'}

Hotline hỗ trợ đo đạc thực tế: ${settings.hotline}
Zalo KTS tư vấn: ${settings.zaloNumber}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mat_Bang_Ky_Thuat_${apartment?.unitCode || 'Can_Ho'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {getActionTitle()}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {getActionSubtitle()}
              </p>

              {apartment && (
                <div className="mt-3.5 inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {apartment.projectName} • {apartment.unitCode} ({apartment.netArea}m²)
                  </span>
                </div>
              )}
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone number */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>Số Điện Thoại Nhận Tài Liệu <strong className="text-red-500">*</strong></span>
                  <span className="text-[11px] font-normal text-slate-400">Gửi qua Zalo / SMS</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Ví dụ: 0912 345 678"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 focus:bg-white text-slate-900 font-bold text-base rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder:font-normal placeholder:text-slate-400"
                    autoFocus
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  Họ và tên của bạn (Tùy chọn)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Anh Nam, Chị Lan..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white text-slate-800 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Note / Questions */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  Ghi chú hoặc yêu cầu thêm (Tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Mình muốn tư vấn thêm phong cách Japandi, cần báo giá..."
                  className="w-full p-2.5 bg-slate-50 focus:bg-white text-slate-800 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Checkbox */}
              <div className="flex items-start space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="zaloConsult"
                  checked={needZaloConsult}
                  onChange={(e) => setNeedZaloConsult(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="zaloConsult" className="text-xs text-slate-600 leading-snug cursor-pointer select-none">
                  KTS hỗ trợ gửi file PDF mặt bằng & tư vấn bóc tách khối lượng qua Zalo
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 inline-flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl font-bold text-base text-white bg-blue-600 hover:bg-blue-700 active:scale-98 shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Đang xử lý & chuẩn bị tài liệu...</span>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Tải Ngay & Nhận Trọn Bộ Bản Vẽ</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-slate-400 flex items-center justify-center space-x-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Bảo mật 100% • Không spam • Hỗ trợ hoàn toàn miễn phí</span>
              </p>
            </form>
          </div>
        ) : (
          /* Success State */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900">
              Đăng Ký Thành Công!
            </h3>

            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              Cảm ơn bạn! Thông tin tài liệu kỹ thuật & mẫu 3D của mã căn{' '}
              <strong className="text-slate-900">{apartment?.unitCode}</strong> đã sẵn sàng.
            </p>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-left space-y-2.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-blue-900">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Link tải tài liệu của bạn:</span>
              </div>
              <p className="text-xs text-blue-700">
                Nhấn vào nút bên dưới để tải trực tiếp file thông số kích thước & sơ đồ mặt bằng kỹ thuật:
              </p>
              <button
                onClick={handleDownloadDirect}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm inline-flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tải Xuống File Kỹ Thuật (TXT/PDF)</span>
              </button>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <a
                href={settings.zaloLink || `https://zalo.me/${settings.zaloNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Nhắn Zalo Nhận Bản Vẽ CAD</span>
              </a>

              <button
                onClick={onClose}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
