import React, { useState } from 'react';
import {
  Ruler,
  Palette,
  Calculator,
  Key,
  ShieldCheck,
  CheckCircle,
  Phone,
  Send,
  Sparkles,
  Building,
} from 'lucide-react';
import { AppSettings } from '../types';
import { submitLead } from '../services/storageService';
import confetti from 'canvas-confetti';

interface ConsultationSectionProps {
  settings: AppSettings;
  onLeadSubmitted: () => void;
}

export const ConsultationSection: React.FC<ConsultationSectionProps> = ({
  settings,
  onLeadSubmitted,
}) => {
  const [customPhone, setCustomPhone] = useState('');
  const [customUnit, setCustomUnit] = useState('');
  const [customProject, setCustomProject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPhone.trim()) return;

    setIsSubmitting(true);
    try {
      await submitLead({
        fullName: 'Khách yêu cầu căn mới',
        phoneNumber: customPhone.trim(),
        projectId: 'custom',
        projectName: customProject.trim() || 'Dự án khác',
        unitCode: customUnit.trim() || 'Yêu cầu tìm mã căn',
        action: 'book_consult',
        actionName: 'Yêu cầu tìm mã căn & đo đạc miễn phí',
        note: `Khách cần tìm thông tin dự án ${customProject || 'chưa rõ'} - Mã căn: ${customUnit || 'chưa rõ'}`,
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      onLeadSubmitted();

      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      } catch (e) {}
    } catch (e) {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section 1: 4-Step Process */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Quy Trình Chuẩn 4 Bước</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Từ Kích Thước Thực Tế Đến Căn Hộ Hoàn Hảo
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Chúng tôi đồng hành cùng chủ nhà từ ngày nhận bàn giao thô đến lúc nhận chìa khóa vào ở với sự an tâm tuyệt đối.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100/50 rounded-bl-3xl flex items-top justify-end p-3 text-blue-600 font-extrabold text-lg">
              01
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <Ruler className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 mb-1.5">
                1. Khảo Sát & Đo Đạc 0đ
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                KTS trực tiếp tới căn hộ đo laser chính xác từng milimet kích thước tường, trần, hộp kỹ thuật và vị trí nguồn điện nước.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-100/50 rounded-bl-3xl flex items-top justify-end p-3 text-indigo-600 font-extrabold text-lg">
              02
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 mb-1.5">
                2. Thiết Kế 3D Cá Nhân
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lên phối cảnh 3D trực quan theo đúng thói quen sinh hoạt và phong cách yêu thích (Hiện đại, Japandi, Indochine...).
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-100/50 rounded-bl-3xl flex items-top justify-end p-3 text-emerald-600 font-extrabold text-lg">
              03
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 mb-1.5">
                3. Báo Giá & Không Phát Sinh
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bóc tách chi tiết từng mét vuông gỗ, phụ kiện bản lề, cam kết đúng vật liệu chuẩn An Cường 100%, không phát sinh 1 đồng.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-100/50 rounded-bl-3xl flex items-top justify-end p-3 text-amber-600 font-extrabold text-lg">
              04
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 mb-1.5">
                4. Thi Công & Bàn Giao
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sản xuất trực tiếp tại xưởng với máy móc tự động CNC, thi công lắp đặt nhanh chỉ 15 - 20 ngày, bảo hành 24 tháng.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Banner "Chưa tìm thấy mã căn của bạn?" */}
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                Hỗ Trợ Khảo Sát & Bản Vẽ Miễn Phí
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Chưa Tìm Thấy Mã Căn Hoặc Cần Kích Thước Riêng?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Nhập số điện thoại và tên dự án của bạn, đội ngũ KTS sẽ liên hệ gửi bản vẽ mặt bằng PDF/CAD và hỗ trợ bạn trực tiếp trong vòng 15 phút.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-blue-200 pt-2">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Miễn phí 100%</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Gửi bản vẽ qua Zalo ngay</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Bảo mật tuyệt đối</span>
                </span>
              </div>
            </div>

            {/* Right form */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
              {!isSuccess ? (
                <form onSubmit={handleCustomSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Số điện thoại của bạn <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      placeholder="Ví dụ: 0988 123 456"
                      className="w-full px-3.5 py-2.5 bg-white text-slate-900 font-bold rounded-xl text-sm focus:ring-2 focus:ring-blue-400 placeholder:font-normal"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1">
                        Tên Dự Án:
                      </label>
                      <input
                        type="text"
                        value={customProject}
                        onChange={(e) => setCustomProject(e.target.value)}
                        placeholder="VD: Vinhomes, Masteri..."
                        className="w-full px-3 py-2 bg-white text-slate-900 text-xs rounded-xl focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1">
                        Mã Căn (Nếu có):
                      </label>
                      <input
                        type="text"
                        value={customUnit}
                        onChange={(e) => setCustomUnit(e.target.value)}
                        placeholder="VD: Căn 08 Tòa S2"
                        className="w-full px-3 py-2 bg-white text-slate-900 text-xs rounded-xl focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 active:scale-98 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Đang gửi...' : 'Gửi Yêu Cầu Cho KTS'}</span>
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-white">Đã Nhận Yêu Cầu!</h4>
                  <p className="text-xs text-slate-300">
                    KTS sẽ liên hệ qua Zalo/Số điện thoại <strong>{customPhone}</strong> trong ít phút để gửi tài liệu cho bạn.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
