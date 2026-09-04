import React, { useRef, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, X, Check, Link2, Sparkles, RefreshCw, Eye } from 'lucide-react';
import { processImageFileToDataUrl as uploadToService, isCloudinaryConfigured } from '../services/cloudinaryUpload';

interface ImageUploadInputProps {
  label?: string;
  value: string;
  onChange: (dataUrlOrHttpUrl: string) => void;
  placeholder?: string;
  helperText?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
  className?: string;
}

// Re-export from Cloudinary service (Quick Win #2). Falls back to base64 if Cloudinary not configured.
// Re-export from Cloudinary service. Signature kept identical to old local implementation.
// If Cloudinary is configured, uploads to CDN and returns the optimized URL (~150 bytes).
// If not, falls back to a base64 data URL so the rest of the app continues to work.
export const processImageFileToDataUrl = async (
  file: File,
  _maxWidth?: number,
  _maxHeight?: number,
  _quality?: number
): Promise<string> => {
  if (isCloudinaryConfigured()) {
    return uploadToService(file);
  }
  // Inline base64 fallback (preserves old behavior when Cloudinary not configured)
  return base64Fallback(file, _maxWidth ?? 1600, _maxHeight ?? 1200, _quality ?? 0.85);
};

// Local base64 fallback kept for when Cloudinary is not configured
function base64Fallback(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            width = maxWidth;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Không thể đọc dữ liệu ảnh'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Lỗi khi mở file từ máy tính'));
    reader.readAsDataURL(file);
  });
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'https://... hoặc tải ảnh từ máy tính',
  helperText,
  aspectRatio = 'auto',
  className = '',
}) => {
  // Default mode: nếu value là URL → 'url', nếu là data URL → 'upload'
  const [mode, setMode] = useState<'upload' | 'url'>(() =>
    value && !value.startsWith('data:') ? 'url' : 'upload'
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Local state cho input URL — cho phép user gõ mà không commit ngay
  const [urlDraft, setUrlDraft] = useState<string>(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Đồng bộ urlDraft với value khi value thay đổi từ bên ngoài
  useEffect(() => {
    setUrlDraft(value || '');
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    await handleProcessFile(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Vui lòng chọn file hình ảnh (JPG, PNG, WEBP, GIF)');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const dataUrl = await processImageFileToDataUrl(file);
      onChange(dataUrl);
      setMode('upload');
    } catch (err) {
      console.error(err);
      setErrorMsg('Lỗi khi tải ảnh lên từ máy tính');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await handleProcessFile(file);
    }
  };

  const handleClear = () => {
    onChange('');
    setUrlDraft('');
    setErrorMsg(null);
  };

  const handleUrlCommit = () => {
    if (urlDraft !== value) {
      onChange(urlDraft);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrlDraft(text);
      onChange(text);
    } catch {
      setErrorMsg('Không thể đọc clipboard. Hãy paste thủ công (Ctrl+V).');
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-700">{label}</label>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="space-y-2">
        {/* Mode tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`text-[11px] px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center space-x-1 ${
              mode === 'upload'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Tải Từ Máy</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`text-[11px] px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center space-x-1 ${
              mode === 'url'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link2 className="w-3 h-3" />
            <span>Dán Link URL</span>
          </button>
        </div>

        {/* Main content: preview + form */}
        {mode === 'upload' ? (
          <div className="space-y-2">
            {value ? (
              // Đã có ảnh - hiển thị preview
              <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-2 overflow-hidden group">
                <div className="flex items-center space-x-3">
                  <div className="w-20 h-20 sm:w-24 sm:h-20 rounded-lg overflow-hidden border border-slate-300 bg-slate-100 shrink-0 relative">
                    <img
                      src={value}
                      alt="Xem trước ảnh"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-semibold">
                      <Check className="w-3.5 h-3.5" />
                      <span>Ảnh đã tải lên sẵn sàng</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate font-mono">
                      {value.startsWith('data:') ? 'Ảnh lưu từ máy tính (Data Image)' : value}
                    </p>
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Thay Ảnh Khác</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleClear}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        <span>Xóa Ảnh</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Chưa có ảnh - hiển thị drop zone
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30'
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    {isLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800">
                      {isLoading ? 'Đang nén và tải ảnh lên...' : 'Bấm để chọn ảnh từ máy tính'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      hoặc kéo & thả file ảnh trực tiếp vào đây (JPG, PNG, WEBP)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Mode URL - luôn hiển thị input kể cả khi đã có ảnh
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="url"
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                onBlur={handleUrlCommit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUrlCommit();
                  }
                }}
                placeholder={placeholder}
                className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer flex items-center space-x-1"
                title="Dán từ clipboard"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Paste</span>
              </button>
              <button
                type="button"
                onClick={handleUrlCommit}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Áp dụng
              </button>
            </div>
            {/* Live preview khi URL hợp lệ */}
            {urlDraft && urlDraft.startsWith('http') && (
              <div className="flex items-center space-x-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-300 bg-slate-100 shrink-0">
                  <img
                    src={urlDraft}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.opacity = '0.3';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>Xem trước URL</span>
                  </p>
                  <p className="text-[10px] text-slate-500 truncate font-mono">{urlDraft}</p>
                </div>
                {value === urlDraft ? (
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>Đã áp dụng</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleUrlCommit}
                    className="text-[10px] text-blue-700 font-bold hover:underline"
                  >
                    Áp dụng URL này →
                  </button>
                )}
              </div>
            )}
            {value && (
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                <span>Hoặc</span>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-red-600 hover:underline font-semibold"
                >
                  Xóa ảnh này
                </button>
                <span>để upload ảnh khác từ máy tính.</span>
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {errorMsg && <p className="text-xs text-red-600 font-semibold">{errorMsg}</p>}
        {helperText && <p className="text-[11px] text-slate-400">{helperText}</p>}
      </div>
    </div>
  );
};
