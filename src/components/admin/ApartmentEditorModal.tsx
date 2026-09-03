/**
 * ApartmentEditorModal - Modal chỉnh sửa căn hộ.
 * Tách riêng từ AdminPortal.tsx.
 */

import React, { useRef, useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Video,
  Compass,
  ExternalLink,
  Upload,
} from 'lucide-react';
import { ApartmentUnit, ApartmentUnitType, InteriorImage, Project, VideoItem } from '../../types';
import { ImageUploadInput, processImageFileToDataUrl } from '../ImageUploadInput';
import { parseVideoInfo } from '../../utils/videoUtils';

interface ApartmentEditorModalProps {
  apartment: ApartmentUnit;
  projects: Project[];
  onClose: () => void;
  onSave: (apt: ApartmentUnit) => void;
}

export const ApartmentEditorModal: React.FC<ApartmentEditorModalProps> = ({
  apartment,
  projects,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<ApartmentUnit>({ ...apartment });
  const batch3dInputRef = useRef<HTMLInputElement>(null);

  const handleBatch3dUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newImages: InteriorImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        try {
          const dataUrl = await processImageFileToDataUrl(file);
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          newImages.push({
            id: 'img-' + Date.now() + '-' + i,
            title:
              cleanName ||
              `Ảnh 3D ${
                formData.interiorImages?.length ? formData.interiorImages.length + i + 1 : i + 1
              }`,
            style: 'modern',
            styleName: 'Hiện Đại',
            url: dataUrl,
            roomType: 'living',
            roomTypeName: 'Phòng Khách',
          });
        } catch (err) {
          console.error('Lỗi khi đọc file ảnh:', file.name, err);
        }
      }
    }
    if (newImages.length > 0) {
      setFormData((prev) => ({
        ...prev,
        interiorImages: [...(prev.interiorImages || []), ...newImages],
      }));
    }
    if (batch3dInputRef.current) batch3dInputRef.current.value = '';
  };

  const handleAddImage = () => {
    const newImg: InteriorImage = {
      id: 'img-' + Date.now(),
      title: 'Mẫu Phòng Khách Mới',
      style: 'modern',
      styleName: 'Hiện Đại',
      url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
      roomType: 'living',
      roomTypeName: 'Phòng Khách',
    };
    setFormData({ ...formData, interiorImages: [...(formData.interiorImages || []), newImg] });
  };

  const handleUpdateImage = (index: number, field: keyof InteriorImage, value: any) => {
    const updated = [...(formData.interiorImages || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, interiorImages: updated });
  };

  const handleDeleteImage = (index: number) => {
    const updated = (formData.interiorImages || []).filter((_, i) => i !== index);
    setFormData({ ...formData, interiorImages: updated });
  };

  const handleAddVideo = () => {
    const defaultUrl = 'https://www.youtube.com/watch?v=ScMzIvxBSi4';
    const parsed = parseVideoInfo(defaultUrl);
    const newVid: VideoItem = {
      id: 'vid-' + Date.now(),
      title: 'Video Hiện Trạng & Tour Căn Hộ',
      type: 'handover',
      typeName: 'Hiện Trạng Bàn Giao',
      platform:
        parsed.platform === 'tiktok'
          ? 'tiktok'
          : parsed.platform === 'facebook'
          ? 'facebook'
          : parsed.platform === 'direct'
          ? 'direct'
          : 'youtube',
      videoUrl: parsed.directUrl || defaultUrl,
      embedUrl: parsed.embedUrl || defaultUrl,
      thumbnailUrl:
        parsed.thumbnailUrl ||
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80',
    };
    setFormData({ ...formData, videos: [...(formData.videos || []), newVid] });
  };

  const handleUpdateVideo = (index: number, field: keyof VideoItem, value: any) => {
    const updated = [...(formData.videos || [])];
    if (field === 'videoUrl' || field === 'embedUrl') {
      const parsed = parseVideoInfo(value);
      updated[index] = {
        ...updated[index],
        videoUrl: value,
        embedUrl: parsed.embedUrl || value,
        platform:
          parsed.platform === 'tiktok'
            ? 'tiktok'
            : parsed.platform === 'facebook'
            ? 'facebook'
            : parsed.platform === 'direct'
            ? 'direct'
            : 'youtube',
        thumbnailUrl: updated[index].thumbnailUrl || parsed.thumbnailUrl,
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setFormData({ ...formData, videos: updated });
  };

  const handleDeleteVideo = (index: number) => {
    const updated = (formData.videos || []).filter((_, i) => i !== index);
    setFormData({ ...formData, videos: updated });
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <h3 className="text-base sm:text-lg font-bold">
            Chỉnh Sửa Thông Tin Căn Hộ: {formData.unitCode}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Classification Section: Trục Căn & Dạng Căn */}
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b border-amber-200">
              <Compass className="w-4 h-4 text-amber-700" />
              <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                Phân Loại Quản Trị: Trục Căn Chung Cư & Dạng Căn Điển Hình (Độc Lập)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-xl border border-amber-300 shadow-2xs space-y-2">
                <label className="block text-xs font-bold text-amber-900 flex items-center justify-between">
                  <span>1. Trục Căn Chung Cư (Axis):</span>
                  <span className="text-[10px] font-normal text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    Khách tra cứu độc lập
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.axisNumber || ''}
                  onChange={(e) => setFormData({ ...formData, axisNumber: e.target.value })}
                  placeholder="VD: Trục 08, Trục 05A, Trục 12..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-amber-950"
                />
                <div className="flex flex-wrap gap-1 items-center pt-1">
                  <span className="text-[10px] text-slate-500">Gợi ý nhanh:</span>
                  {[
                    'Trục 01',
                    'Trục 02',
                    'Trục 03',
                    'Trục 05',
                    'Trục 06',
                    'Trục 08',
                    'Trục 09',
                    'Trục 10',
                    'Trục 12',
                    'Trục 15',
                    'Trục 16',
                  ].map((ax) => (
                    <button
                      key={ax}
                      type="button"
                      onClick={() => setFormData({ ...formData, axisNumber: ax })}
                      className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                        formData.axisNumber === ax
                          ? 'bg-amber-600 text-white font-bold'
                          : 'bg-amber-100/80 hover:bg-amber-200 text-amber-900'
                      }`}
                    >
                      {ax}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-blue-300 shadow-2xs space-y-2">
                <label className="block text-xs font-bold text-blue-900 flex items-center justify-between">
                  <span>2. Dạng Căn Điển Hình:</span>
                  <span className="text-[10px] font-normal text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                    Theo cấu trúc phòng ngủ
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Mã Dạng Căn:</span>
                    <select
                      value={formData.unitType}
                      onChange={(e) =>
                        setFormData({ ...formData, unitType: e.target.value as ApartmentUnitType })
                      }
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 font-medium"
                    >
                      <option value="studio">Studio</option>
                      <option value="1pn">1 Phòng Ngủ</option>
                      <option value="1pn_plus">1 Phòng Ngủ + 1</option>
                      <option value="2pn_1wc">2 Phòng Ngủ - 1WC</option>
                      <option value="2pn_2wc">2 Phòng Ngủ - 2WC</option>
                      <option value="3pn">3 Phòng Ngủ</option>
                      <option value="duplex">Căn Hộ Duplex</option>
                      <option value="penthouse">Penthouse</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Tên Hiển Thị:</span>
                    <input
                      type="text"
                      value={formData.unitTypeName}
                      onChange={(e) => setFormData({ ...formData, unitTypeName: e.target.value })}
                      placeholder="2 Phòng Ngủ + 2WC"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dự Án:</label>
              <select
                value={formData.projectId}
                onChange={(e) => {
                  const proj = projects.find((p) => p.id === e.target.value);
                  setFormData({
                    ...formData,
                    projectId: e.target.value,
                    projectName: proj?.name || formData.projectName,
                  });
                }}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mã Căn Hộ:</label>
              <input
                type="text"
                value={formData.unitCode}
                onChange={(e) => setFormData({ ...formData, unitCode: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tòa / Tháp:</label>
              <input
                type="text"
                value={formData.tower}
                onChange={(e) => setFormData({ ...formData, tower: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                DT Thông Thủy (m²):
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.netArea}
                onChange={(e) => setFormData({ ...formData, netArea: Number(e.target.value) })}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                DT Tim Tường (m²):
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.grossArea}
                onChange={(e) => setFormData({ ...formData, grossArea: Number(e.target.value) })}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chiều Cao Trần (m):
              </label>
              <input
                type="number"
                step="0.05"
                value={formData.ceilingHeight}
                onChange={(e) =>
                  setFormData({ ...formData, ceilingHeight: Number(e.target.value) })
                }
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
              />
            </div>
            <div className="sm:col-span-3">
              <ImageUploadInput
                label="Ảnh Sơ Đồ Mặt Bằng Kỹ Thuật (CAD/2D Drawing):"
                value={formData.floorPlanImageUrl}
                onChange={(val) => setFormData({ ...formData, floorPlanImageUrl: val })}
                placeholder="https://... hoặc bấm tải ảnh sơ đồ mặt bằng từ máy tính"
                helperText="Hỗ trợ tải trực tiếp từ máy tính (PNG, JPG, WEBP) hoặc dán link URL bản vẽ. Thông tin kích thước chi tiết được thể hiện trực quan trên ảnh."
              />
            </div>
          </div>

          {/* Section: 3D Images */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-amber-500" />
                <span>Thư Viện Ảnh 3D Nội Thất ({formData.interiorImages?.length || 0})</span>
              </h4>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  multiple
                  ref={batch3dInputRef}
                  accept="image/*"
                  onChange={handleBatch3dUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => batch3dInputRef.current?.click()}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải Nhiều Ảnh Từ Máy Tính</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Ô Trống</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {(formData.interiorImages || []).map((img, idx) => (
                <div
                  key={img.id || idx}
                  className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-4">
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                        Tiêu đề ảnh:
                      </label>
                      <input
                        type="text"
                        value={img.title}
                        onChange={(e) => handleUpdateImage(idx, 'title', e.target.value)}
                        placeholder="Tiêu đề ảnh"
                        className="w-full bg-slate-50 border rounded-lg px-2.5 py-1.5 font-semibold"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                        Phong cách thiết kế:
                      </label>
                      <select
                        value={img.style}
                        onChange={(e) => handleUpdateImage(idx, 'style', e.target.value)}
                        className="w-full bg-slate-50 border rounded-lg px-2 py-1.5"
                      >
                        <option value="modern">Hiện Đại</option>
                        <option value="japandi">Japandi</option>
                        <option value="minimalist">Tối Giản</option>
                        <option value="indochine">Đông Dương</option>
                        <option value="luxury">Luxury</option>
                      </select>
                    </div>
                    <div className="sm:col-span-4">
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                        Không gian phòng:
                      </label>
                      <select
                        value={img.roomType || 'living'}
                        onChange={(e) => {
                          const val = e.target.value;
                          const nameMap: Record<string, string> = {
                            living: 'Phòng Khách',
                            master_bedroom: 'Phòng Ngủ Master',
                            bedroom_2: 'Phòng Ngủ 2',
                            kitchen: 'Phòng Bếp & Ăn',
                            bathroom: 'Phòng Tắm / WC',
                            balcony: 'Ban Công / Logia',
                          };
                          handleUpdateImage(idx, 'roomType', val);
                          handleUpdateImage(idx, 'roomTypeName', nameMap[val] || 'Phòng');
                        }}
                        className="w-full bg-slate-50 border rounded-lg px-2 py-1.5"
                      >
                        <option value="living">Phòng Khách</option>
                        <option value="master_bedroom">Phòng Ngủ Master</option>
                        <option value="bedroom_2">Phòng Ngủ 2</option>
                        <option value="kitchen">Phòng Bếp & Ăn</option>
                        <option value="bathroom">Phòng Tắm / WC</option>
                        <option value="balcony">Ban Công / Logia</option>
                      </select>
                    </div>
                    <div className="sm:col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(idx)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Xóa ảnh này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <ImageUploadInput
                    value={img.url}
                    onChange={(newUrl) => handleUpdateImage(idx, 'url', newUrl)}
                    placeholder="https://... hoặc tải ảnh 3D từ máy tính"
                    helperText="Tải file 3D từ máy tính hoặc dán link URL"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section: Videos */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <Video className="w-4 h-4 text-red-500" />
                  <span>
                    Video Hiện Trạng, Tour & TikTok/YouTube ({formData.videos?.length || 0})
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Dán link YouTube (watch, shorts, embed), TikTok, Facebook, Drive hoặc link file MP4
                  trực tiếp. Hệ thống tự động nhận diện và chuyển đổi.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddVideo}
                className="shrink-0 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Video</span>
              </button>
            </div>

            <div className="space-y-3">
              {(formData.videos || []).map((vid, idx) => {
                const parsed = parseVideoInfo(vid.videoUrl || vid.embedUrl, vid.thumbnailUrl);
                return (
                  <div
                    key={vid.id || idx}
                    className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2 text-xs shadow-2xs"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-4">
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                          Tiêu đề video:
                        </label>
                        <input
                          type="text"
                          value={vid.title}
                          onChange={(e) => handleUpdateVideo(idx, 'title', e.target.value)}
                          placeholder="Tiêu đề video (vd: Tour căn hộ bàn giao thực tế)"
                          className="w-full bg-slate-50 border rounded-lg px-2.5 py-1.5 font-semibold"
                        />
                      </div>
                      <div className="sm:col-span-7">
                        <label className="text-[10px] font-bold text-slate-500 flex items-center justify-between mb-0.5">
                          <span>Link Video (YouTube, TikTok, Facebook, MP4...):</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-700">
                            Nền tảng: {parsed.platformDisplayName}
                          </span>
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="url"
                            value={vid.videoUrl || vid.embedUrl}
                            onChange={(e) => handleUpdateVideo(idx, 'videoUrl', e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=... hoặc TikTok, Facebook"
                            className="w-full bg-slate-50 border rounded-lg px-2.5 py-1.5 font-mono text-[11px]"
                          />
                          {(vid.videoUrl || vid.embedUrl) && (
                            <a
                              href={parsed.directUrl || vid.videoUrl || vid.embedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg border flex items-center space-x-1"
                              title="Kiểm tra mở thử link video trong tab mới"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Mở thử</span>
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="sm:col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteVideo(idx)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Xóa video này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end space-x-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={() => onSave(formData)}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
          >
            Lưu Thay Đổi Căn Hộ
          </button>
        </div>
      </div>
    </div>
  );
};
