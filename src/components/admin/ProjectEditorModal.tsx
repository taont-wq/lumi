/**
 * ProjectEditorModal - Modal chỉnh sửa dự án.
 * Tách riêng từ AdminPortal.tsx.
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Project } from '../../types';
import { ImageUploadInput } from '../ImageUploadInput';

interface ProjectEditorModalProps {
  project: Project;
  onClose: () => void;
  onSave: (proj: Project) => void;
}

export const ProjectEditorModal: React.FC<ProjectEditorModalProps> = ({
  project,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Project>({ ...project });
  const [towersText, setTowersText] = useState(project.towers.join(', '));

  const handleSave = () => {
    const parsedTowers = towersText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    onSave({ ...formData, towers: parsedTowers });
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-base text-slate-900">Chỉnh Sửa Dự Án Chung Cư</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Tên Dự Án:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 bg-slate-50 border rounded-xl font-bold"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Vị Trí:</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full p-2 bg-slate-50 border rounded-xl"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Chủ Đầu Tư:</label>
            <input
              type="text"
              value={formData.developer}
              onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
              className="w-full p-2 bg-slate-50 border rounded-xl"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Danh Sách Tòa Tháp (Ngăn cách bằng dấu phẩy):
            </label>
            <input
              type="text"
              value={towersText}
              onChange={(e) => setTowersText(e.target.value)}
              placeholder="S1.01, S1.02, S2.05..."
              className="w-full p-2 bg-slate-50 border rounded-xl"
            />
          </div>
          <div>
            <ImageUploadInput
              label="Ảnh Phối Cảnh Banner Dự Án:"
              value={formData.bannerUrl}
              onChange={(val) => setFormData({ ...formData, bannerUrl: val })}
              placeholder="https://... hoặc tải ảnh từ máy tính"
              helperText="Tải file ảnh phối cảnh dự án từ máy tính hoặc dán link URL"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2 border-t">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600">
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Lưu Dự Án
          </button>
        </div>
      </div>
    </div>
  );
};
