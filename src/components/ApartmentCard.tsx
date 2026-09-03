import React from 'react';
import {
  Maximize2,
  Download,
  Video,
  Image as ImageIcon,
  ArrowUpRight,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { ApartmentUnit } from '../types';

interface ApartmentCardProps {
  apartment: ApartmentUnit;
  onViewDetail: (apartment: ApartmentUnit, defaultTab?: string) => void;
  onDownloadBlueprint: (apartment: ApartmentUnit) => void;
  onRequestQuote: (apartment: ApartmentUnit) => void;
}

export const ApartmentCard: React.FC<ApartmentCardProps> = ({
  apartment,
  onViewDetail,
  onDownloadBlueprint,
  onRequestQuote,
}) => {
  const imagesCount = apartment.interiorImages?.length || 0;
  const videosCount = apartment.videos?.length || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
      {/* Top Banner / Image Preview */}
      <div className="relative h-52 sm:h-56 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onViewDetail(apartment)}>
        {/* Main image (first 3D or floorplan) */}
        <img
          src={
            apartment.interiorImages && apartment.interiorImages.length > 0
              ? apartment.interiorImages[0].url
              : apartment.floorPlanImageUrl
          }
          alt={apartment.unitCode}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center space-x-1.5">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-xs backdrop-blur-xs">
              {apartment.projectName}
            </span>
            {apartment.axisNumber && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-slate-900 shadow-xs backdrop-blur-xs">
                {apartment.axisNumber}
              </span>
            )}
          </div>
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/90 text-slate-800 shadow-xs backdrop-blur-xs">
            {apartment.tower}
          </span>
        </div>

        {/* Bottom overlay info inside image */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-blue-200 font-medium">{apartment.unitTypeName}</p>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center space-x-1.5">
                <span>Mã Căn: {apartment.unitCode}</span>
              </h3>
            </div>

            {/* Quick Media Indicators */}
            <div className="flex items-center space-x-1.5 text-xs">
              {imagesCount > 0 && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-black/50 text-white backdrop-blur-xs">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
                  <span>{imagesCount} 3D</span>
                </span>
              )}
              {videosCount > 0 && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-red-600/80 text-white backdrop-blur-xs">
                  <Video className="w-3.5 h-3.5" />
                  <span>{videosCount} Video</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
          <div>
            <span className="text-[11px] text-slate-500 block">DT Thông Thủy</span>
            <span className="text-sm font-extrabold text-blue-700">{apartment.netArea} m²</span>
          </div>
          <div className="border-x border-slate-200">
            <span className="text-[11px] text-slate-500 block">DT Tim Tường</span>
            <span className="text-sm font-bold text-slate-800">{apartment.grossArea} m²</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Cao Trần</span>
            <span className="text-sm font-bold text-slate-800">{apartment.ceilingHeight} m</span>
          </div>
        </div>

        {/* 3D thumbnails gallery preview */}
        {apartment.interiorImages && apartment.interiorImages.length > 0 && (
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Mẫu 3D nội thất ({apartment.interiorImages.length} ảnh):</span>
              </span>
              <button
                onClick={() => onViewDetail(apartment, '3d')}
                className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center cursor-pointer"
              >
                Xem tất cả <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {apartment.interiorImages.slice(0, 4).map((img, idx) => (
                <div
                  key={img.id || idx}
                  onClick={() => onViewDetail(apartment, '3d')}
                  className="relative aspect-4/3 rounded-lg overflow-hidden border border-slate-200 cursor-pointer group/thumb"
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/20 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          {/* Primary View Detail Button */}
          <button
            onClick={() => onViewDetail(apartment)}
            className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-98 shadow-sm transition-all cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Xem Chi Tiết Căn Hộ</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            {/* Download Blueprint Button */}
            <button
              onClick={() => onDownloadBlueprint(apartment)}
              className="inline-flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 active:scale-98 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Tải Bản Vẽ CAD/PDF</span>
            </button>

            {/* Request Quote Button */}
            <button
              onClick={() => onRequestQuote(apartment)}
              className="inline-flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 active:scale-98 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nhận Dự Toán Mẫu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
