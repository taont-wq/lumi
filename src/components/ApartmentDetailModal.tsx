import React, { useState } from 'react';
import {
  X,
  Ruler,
  Image as ImageIcon,
  Video,
  Download,
  Phone,
  MessageSquare,
  Building,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Play,
  Share2,
} from 'lucide-react';
import { ApartmentUnit, AppSettings, InteriorDesignStyle, InteriorImage, VideoItem } from '../types';
import { parseVideoInfo, openExternalVideo } from '../utils/videoUtils';

interface ApartmentDetailModalProps {
  apartment: ApartmentUnit | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  settings: AppSettings;
  onOpenDownloadModal: (apartment: ApartmentUnit, actionType: 'download_blueprint' | 'download_catalogue' | 'request_quotation' | 'book_consult') => void;
}

export const ApartmentDetailModal: React.FC<ApartmentDetailModalProps> = ({
  apartment,
  isOpen,
  onClose,
  initialTab = 'dimensions',
  settings,
  onOpenDownloadModal,
}) => {
  const [activeTab, setActiveTab] = useState<'dimensions' | '3d' | 'videos' | 'cost'>(
    initialTab as any || 'dimensions'
  );
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [lightboxImage, setLightboxImage] = useState<InteriorImage | null>(null);
  const [activePlayingVideo, setActivePlayingVideo] = useState<VideoItem | null>(null);

  if (!isOpen || !apartment) return null;

  // Filter 3D images
  const filteredImages = (apartment.interiorImages || []).filter((img) => {
    const matchStyle = selectedStyle === 'all' || img.style === selectedStyle;
    const matchRoom = selectedRoomType === 'all' || img.roomType === selectedRoomType;
    return matchStyle && matchRoom;
  });

  const totalRoomAreaSum = (apartment.roomDimensions || []).reduce(
    (acc, r) => acc + (r.area || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Modal Top Header */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Mã Căn: {apartment.unitCode}
                </h2>
                {apartment.axisNumber && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500 text-slate-900 shadow-2xs">
                    {apartment.axisNumber}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  {apartment.unitTypeName}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  {apartment.projectName} • {apartment.tower}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 flex items-center space-x-2">
                <span>Thông Thủy: <strong className="text-blue-600 font-bold">{apartment.netArea}m²</strong></span>
                <span>•</span>
                <span>Tim Tường: {apartment.grossArea}m²</span>
                <span>•</span>
                <span>Trần: {apartment.ceilingHeight}m</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenDownloadModal(apartment, 'download_blueprint')}
              className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Tải Bản Vẽ CAD/PDF</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 sm:px-8 border-b border-slate-200 bg-slate-50/70 flex space-x-2 sm:space-x-4 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('dimensions')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'dimensions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Ruler className="w-4 h-4" />
            <span>Sơ Đồ Mặt Bằng Kỹ Thuật (2D)</span>
          </button>

          <button
            onClick={() => setActiveTab('3d')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === '3d'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-amber-500" />
            <span>Mẫu Thiết Kế 3D ({apartment.interiorImages?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'videos'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-4 h-4 text-red-500" />
            <span>Video Hiện Trạng & Tour ({apartment.videos?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('cost')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'cost'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Dự Toán & Báo Giá Mẫu</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-white space-y-6">
          {/* TAB 1: SƠ ĐỒ MẶT BẰNG KỸ THUẬT */}
          {activeTab === 'dimensions' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Floor Plan Blueprint Viewer */}
                <div className="lg:col-span-7 bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center space-x-1.5">
                      <Ruler className="w-4 h-4 text-blue-600" />
                      <span>Bản Vẽ Sơ Đồ Mặt Bằng Kỹ Thuật (2D CAD)</span>
                    </span>

                    {/* Zoom controls */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setZoomLevel((prev) => Math.max(0.8, prev - 0.2))}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                        title="Thu nhỏ"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[11px] font-semibold text-slate-500 w-10 text-center">
                        {Math.round(zoomLevel * 100)}%
                      </span>
                      <button
                        onClick={() => setZoomLevel((prev) => Math.min(2.2, prev + 0.2))}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                        title="Phóng to"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setZoomLevel(1)}
                        className="text-[11px] font-medium px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                      >
                        Đặt lại
                      </button>
                    </div>
                  </div>

                  {/* Floor Plan Image Box */}
                  <div className="relative min-h-[360px] sm:min-h-[440px] bg-white rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center p-2 group shadow-2xs">
                    <img
                      src={apartment.floorPlanImageUrl}
                      alt={`Mặt bằng ${apartment.unitCode}`}
                      className="max-h-[460px] max-w-full object-contain transition-transform duration-200"
                      style={{ transform: `scale(${zoomLevel})` }}
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 text-center italic">
                    * Kích thước chi tiết từng không gian, tường ngăn và vị trí cột chịu lực đã thể hiện trực tiếp trên bản vẽ.
                  </p>
                </div>

                {/* Right: Technical Specs & Download CTA */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Technical Specs Card */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3.5">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center space-x-2 pb-2 border-b border-slate-200">
                      <Compass className="w-4 h-4 text-blue-600" />
                      <span>Thông Số Kỹ Thuật Căn Hộ</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                        <span className="text-slate-500 block text-[11px] mb-0.5">Dự Án:</span>
                        <span className="font-bold text-slate-900 line-clamp-1">{apartment.projectName}</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                        <span className="text-slate-500 block text-[11px] mb-0.5">Tòa Tháp:</span>
                        <span className="font-bold text-blue-700">{apartment.tower}</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                        <span className="text-slate-500 block text-[11px] mb-0.5">Trục Căn:</span>
                        <span className="font-bold text-amber-700">{apartment.axisNumber || 'Theo mã căn'}</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                        <span className="text-slate-500 block text-[11px] mb-0.5">Loại Hình Căn:</span>
                        <span className="font-bold text-slate-900">{apartment.unitTypeName}</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                        <span className="text-slate-500 block text-[11px] mb-0.5">DT Thông Thủy:</span>
                        <span className="font-extrabold text-blue-700 text-sm">{apartment.netArea} m²</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                        <span className="text-slate-500 block text-[11px] mb-0.5">DT Tim Tường:</span>
                        <span className="font-bold text-slate-800 text-sm">{apartment.grossArea} m²</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                        <span className="text-slate-500 block text-[11px] mb-0.5">Hướng Cửa & Ban Công:</span>
                        <span className="font-bold text-slate-900">{apartment.direction}</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                        <span className="text-slate-500 block text-[11px] mb-0.5">Chiều Cao Trần:</span>
                        <span className="font-bold text-slate-900">{apartment.ceilingHeight} m</span>
                      </div>
                    </div>
                  </div>

                  {/* Highlights checklist */}
                  {apartment.highlights && apartment.highlights.length > 0 && (
                    <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        <span>Ưu điểm & Gợi ý bố trí không gian:</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {apartment.highlights.map((h, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Big Gated Action Box */}
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white space-y-2.5 shadow-md shadow-blue-500/20">
                    <h4 className="font-extrabold text-sm sm:text-base flex items-center space-x-1.5">
                      <Download className="w-4 h-4" />
                      <span>Tải Trọn Bộ Bản Vẽ CAD & Sơ Đồ MEP</span>
                    </h4>
                    <p className="text-xs text-blue-100 leading-relaxed">
                      Nhận trọn bộ file bóc tách kỹ thuật, kết cấu chịu lực, sơ đồ hệ thống điện âm tường và cấp thoát nước để chuẩn bị làm nội thất.
                    </p>
                    <button
                      onClick={() => onOpenDownloadModal(apartment, 'download_blueprint')}
                      className="w-full mt-2 py-2.5 px-4 bg-white hover:bg-slate-100 active:scale-98 text-blue-900 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4 text-blue-600" />
                      <span>Tải Miễn Phí (Nhập SĐT Nhận File)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THƯ VIỆN MẪU NỘI THẤT 3D */}
          {activeTab === '3d' && (
            <div className="space-y-6">
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                {/* Style selector */}
                <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
                  <span className="text-xs font-bold text-slate-700 whitespace-nowrap mr-1">
                    Phong cách:
                  </span>
                  {[
                    { id: 'all', name: 'Tất Cả' },
                    { id: 'modern', name: 'Hiện Đại' },
                    { id: 'japandi', name: 'Japandi' },
                    { id: 'minimalist', name: 'Tối Giản' },
                    { id: 'indochine', name: 'Đông Dương' },
                    { id: 'luxury', name: 'Luxury' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        selectedStyle === style.id
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>

                {/* Room type selector */}
                <div className="flex items-center space-x-1.5 text-xs text-slate-600">
                  <span className="font-bold text-slate-700">Khu vực:</span>
                  <select
                    value={selectedRoomType}
                    onChange={(e) => setSelectedRoomType(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="all">Tất cả các phòng</option>
                    <option value="living">Phòng Khách</option>
                    <option value="bedroom">Phòng Ngủ</option>
                    <option value="kitchen">Phòng Bếp</option>
                    <option value="bathroom">WC / Phòng Tắm</option>
                  </select>
                </div>
              </div>

              {/* Photos Gallery Grid */}
              {filteredImages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filteredImages.map((img) => (
                    <div
                      key={img.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                      <div
                        className="relative aspect-4/3 overflow-hidden cursor-pointer bg-slate-100"
                        onClick={() => setLightboxImage(img)}
                      >
                        <img
                          src={img.url}
                          alt={img.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-xs flex items-center space-x-1">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Xem ảnh lớn</span>
                          </span>
                        </div>

                        {/* Style Badge */}
                        <div className="absolute top-2.5 left-2.5">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-600 text-white shadow-xs">
                            {img.styleName || img.style}
                          </span>
                        </div>

                        {/* Room Type Badge */}
                        <div className="absolute bottom-2.5 left-2.5">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white/90 text-slate-800 backdrop-blur-xs shadow-xs">
                            {img.roomTypeName || img.roomType}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2">
                          {img.title}
                        </h4>
                        {img.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {img.description}
                          </p>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <button
                            onClick={() => onOpenDownloadModal(apartment, 'download_catalogue')}
                            className="text-xs text-blue-600 font-bold hover:underline flex items-center space-x-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Tải mẫu 3D này</span>
                          </button>

                          <a
                            href={settings.zaloLink || `https://zalo.me/${settings.zaloNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-600 font-bold hover:underline flex items-center space-x-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Tư vấn mẫu này</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
                  <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Chưa có ảnh phù hợp bộ lọc này</p>
                  <button
                    onClick={() => {
                      setSelectedStyle('all');
                      setSelectedRoomType('all');
                    }}
                    className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Xem tất cả {apartment.interiorImages?.length || 0} ảnh 3D
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VIDEO HIỆN TRẠNG & TOUR NỘI THẤT */}
          {activeTab === 'videos' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-amber-900 leading-relaxed flex items-center space-x-2">
                <Video className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  Video quay cận cảnh hiện trạng bàn giao thực tế của căn hộ và các phương án hoàn thiện nội thất trọn gói đã thi công.
                </span>
              </div>

              {apartment.videos && apartment.videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {apartment.videos.map((vid) => {
                    const parsed = parseVideoInfo(vid.embedUrl || vid.videoUrl, vid.thumbnailUrl);
                    const thumbnail = parsed.thumbnailUrl || vid.thumbnailUrl || apartment.floorPlanImageUrl;
                    const directLink = parsed.directUrl || vid.videoUrl || vid.embedUrl;

                    return (
                      <div
                        key={vid.id}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div
                          className="relative aspect-video bg-slate-900 cursor-pointer group"
                          onClick={() => setActivePlayingVideo(vid)}
                        >
                          <img
                            src={thumbnail}
                            alt={vid.title}
                            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                            referrerPolicy="no-referrer"
                          />
                          {/* Play button overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play className="w-6 h-6 fill-white ml-0.5" />
                            </div>
                          </div>

                          {/* Badges */}
                          <div className="absolute top-2 left-2 flex items-center space-x-1.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                              {vid.typeName || vid.type}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-red-600/90 text-white">
                              {parsed.platformDisplayName}
                            </span>
                          </div>
                          {vid.duration && (
                            <div className="absolute bottom-2 right-2">
                              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-black/80 text-white">
                                {vid.duration}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2">
                            {vid.title}
                          </h4>
                          {vid.author && (
                            <p className="text-[11px] text-slate-400">Nguồn: {vid.author}</p>
                          )}

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                            <button
                              onClick={() => setActivePlayingVideo(vid)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-blue-600" />
                              <span>Phát video</span>
                            </button>

                            <a
                              href={directLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Mở app / web</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
                  <Video className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Đang cập nhật video hiện trạng căn này</p>
                  <p className="text-xs text-slate-400 mt-1">Liên hệ Hotline để KTS gửi video quay trực tiếp tại tòa nhà</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DỰ TOÁN CHI PHÍ & BÁO GIÁ MẪU */}
          {activeTab === 'cost' && (
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Dự Toán Hoàn Thiện Nội Thất Căn Hộ {apartment.unitCode}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Bảng chi phí tham khảo cho căn diện tích thông thủy <strong>{apartment.netArea}m²</strong> với 3 cấp độ vật liệu phổ biến nhất hiện nay.
                </p>
              </div>

              {/* 3 Package Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Basic */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800 inline-block mb-2">
                      Gói Cơ Bản (Cho Thuê / Tiết Kiệm)
                    </span>
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                      {apartment.estimatedCostRange?.basic || '85 - 130 Triệu'}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Vật liệu MDF chống ẩm phủ Melamine tiêu chuẩn, phụ kiện Ivan/Huy Hoàng.
                    </p>

                    <ul className="mt-4 space-y-2 text-xs text-slate-700">
                      <li className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Tủ bếp trên + dưới Melamine</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Giường ngủ + Tủ quần áo kịch trần</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Sofa chữ I + Bàn trà + Bàn ăn 4 ghế</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Kệ tivi phòng khách</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => onOpenDownloadModal(apartment, 'request_quotation')}
                    className="w-full py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold text-xs cursor-pointer"
                  >
                    Báo Giá Gói Cơ Bản
                  </button>
                </div>

                {/* Standard (Featured) */}
                <div className="bg-white rounded-2xl p-5 border-2 border-blue-600 shadow-xl flex flex-col justify-between space-y-4 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-extrabold shadow-sm uppercase tracking-wider">
                    Được 80% Chủ Nhà Lựa Chọn
                  </div>

                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 inline-block mb-2">
                      Gói Tiêu Chuẩn (Ở Lâu Dài)
                    </span>
                    <div className="text-xl sm:text-2xl font-extrabold text-blue-700 mt-1">
                      {apartment.estimatedCostRange?.standard || '150 - 220 Triệu'}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      100% Gỗ MDF lõi xanh chống ẩm An Cường chính hãng + Cánh sơn men/Acrylic bóng gương.
                    </p>

                    <ul className="mt-4 space-y-2 text-xs text-slate-700">
                      <li className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Tủ bếp An Cường + Mặt đá Vicostone chống ố</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Tủ áo cánh kính hoặc kịch trần An Cường</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Vách ốp nan gỗ trang trí sau sofa & đầu giường</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Phụ kiện giảm chấn cao cấp Hafele / Blum</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => onOpenDownloadModal(apartment, 'request_quotation')}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    Báo Giá Gói Tiêu Chuẩn
                  </button>
                </div>

                {/* Premium Luxury */}
                <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 inline-block mb-2">
                      Gói Cao Cấp (Luxury / Indochine)
                    </span>
                    <div className="text-xl sm:text-2xl font-extrabold text-amber-400 mt-1">
                      {apartment.estimatedCostRange?.premium || '260 - 450 Triệu'}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Cánh kính EuroGold, Đèn LED cảm ứng, Nẹp inox mạ PVD, Gỗ tự nhiên hoặc vật liệu nhập khẩu.
                    </p>

                    <ul className="mt-4 space-y-2 text-xs text-slate-300">
                      <li className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Toàn bộ hệ tủ áo & tủ rượu cánh kính cao cấp</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Đá Marble tự nhiên / Thạch anh cao cấp</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Hệ thống điện thông minh Smarthome Lumi</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Gói bảo hành vàng 3 năm tại nhà</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => onOpenDownloadModal(apartment, 'request_quotation')}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    Báo Giá Gói Cao Cấp
                  </button>
                </div>
              </div>

              {/* Consultation commitment */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-900">
                <div className="text-xs sm:text-sm">
                  <strong>Cam kết chính sách đặc biệt: </strong>
                  <span>Miễn phí 100% phí thiết kế 3D khi ký hợp đồng thi công trọn gói. Khảo sát & đo đạc hiện trạng miễn phí tại căn hộ.</span>
                </div>
                <button
                  onClick={() => onOpenDownloadModal(apartment, 'book_consult')}
                  className="shrink-0 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Đăng Ký Đo Đạc Miễn Phí
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Sticky CTA Footer */}
        <div className="px-5 sm:px-8 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Cần hỗ trợ gấp:</span>
            <a
              href={`tel:${settings.hotline.replace(/\s+/g, '')}`}
              className="inline-flex items-center space-x-1 font-bold text-blue-600 hover:underline"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>{settings.hotline}</span>
            </a>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => onOpenDownloadModal(apartment, 'download_blueprint')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Tải Sơ Đồ Mặt Bằng (CAD/PDF)</span>
            </button>

            <a
              href={settings.zaloLink || `https://zalo.me/${settings.zaloNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat Zalo</span>
            </a>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for 3D Images */}
      {lightboxImage && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-slate-300 p-2"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="mt-3 text-center text-white space-y-1">
              <h3 className="text-base sm:text-lg font-bold">{lightboxImage.title}</h3>
              <p className="text-xs text-slate-300">
                {lightboxImage.styleName || lightboxImage.style} • {lightboxImage.roomTypeName || lightboxImage.roomType}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {activePlayingVideo && (() => {
        const videoInfo = parseVideoInfo(
          activePlayingVideo.embedUrl || activePlayingVideo.videoUrl,
          activePlayingVideo.thumbnailUrl
        );
        const directLink = videoInfo.directUrl || activePlayingVideo.videoUrl || activePlayingVideo.embedUrl;
        const embedSrc = videoInfo.embedUrl || activePlayingVideo.embedUrl || activePlayingVideo.videoUrl;

        return (
          <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
            <div className="relative max-w-4xl w-full flex flex-col space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between text-white gap-3 bg-slate-900/80 px-4 py-3 rounded-2xl border border-slate-800">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-bold bg-red-600 text-white">
                    {videoInfo.platformDisplayName}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold truncate">{activePlayingVideo.title}</h3>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <a
                    href={directLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mở trên ứng dụng / web gốc</span>
                    <span className="sm:hidden">Mở link</span>
                  </a>

                  <button
                    onClick={() => setActivePlayingVideo(null)}
                    className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 cursor-pointer"
                    title="Đóng video"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Video Player Container */}
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center">
                {videoInfo.platform === 'direct' ? (
                  <video
                    src={embedSrc}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : videoInfo.canEmbedInIframe ? (
                  <iframe
                    src={embedSrc}
                    title={activePlayingVideo.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  /* Fallback screen for third-party blocked embeds (like some TikTok/Facebook links) */
                  <div className="p-6 text-center text-white space-y-4 max-w-md">
                    <div className="w-16 h-16 rounded-full bg-red-600/20 text-red-500 mx-auto flex items-center justify-center border border-red-500/30">
                      <Play className="w-8 h-8 fill-red-500 ml-1" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base sm:text-lg">{activePlayingVideo.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Video từ nền tảng {videoInfo.platformDisplayName} yêu cầu mở trực tiếp trong ứng dụng hoặc trình duyệt để có chất lượng xem tốt nhất.
                      </p>
                    </div>
                    <a
                      href={directLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-lg transition-transform"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Mở Xem Trực Tiếp Trên {videoInfo.platformDisplayName}</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Quick tip footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-2 text-[11px] text-slate-400">
                <span>
                  💡 Nếu video không tải được do chế độ bảo mật trình duyệt, vui lòng bấm nút <strong>"Mở trên ứng dụng / web gốc"</strong> ở trên.
                </span>
                <a
                  href={directLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline inline-flex items-center space-x-1 shrink-0"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Xem trực tiếp ({directLink})</span>
                </a>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
