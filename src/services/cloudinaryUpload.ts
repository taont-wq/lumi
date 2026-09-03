/**
 * Quick Win #2: Cloudinary Upload Service
 * Thay thế base64 inline bằng URL CDN (Cloudinary free 25GB + 25K transformations/tháng)
 *
 * Ưu điểm:
 *  - Không phình localStorage (mỗi ảnh giảm từ ~300KB base64 xuống ~150 bytes URL)
 *  - Cloudinary tự tối ưu: WebP/AVIF, lazy load, srcset
 *  - Có CDN toàn cầu, ảnh load nhanh
 *
 * Setup: xem .env.example
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const USE_CLOUDINARY = import.meta.env.VITE_USE_CLOUDINARY_UPLOAD === 'true';

// ============================================================
//  CONFIG CHECK
// ============================================================

export function isCloudinaryConfigured(): boolean {
  return USE_CLOUDINARY && Boolean(CLOUD_NAME) && Boolean(UPLOAD_PRESET);
}

// ============================================================
//  CLIENT-SIDE VALIDATION
// ============================================================

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export interface ImageValidationError {
  ok: false;
  error: string;
}

export interface ImageValidationOk {
  ok: true;
}

export function validateImageFile(file: File): ImageValidationError | ImageValidationOk {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: `Định dạng không hỗ trợ: ${file.type || 'unknown'}. Chỉ chấp nhận JPG, PNG, WEBP, GIF.` };
  }
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_FILE_SIZE_MB) {
    return { ok: false, error: `File quá lớn (${sizeMB.toFixed(1)}MB). Tối đa ${MAX_FILE_SIZE_MB}MB.` };
  }
  return { ok: true };
}

// ============================================================
//  CLIENT-SIDE RESIZE (giảm bandwidth, upload nhanh hơn)
// ============================================================

export interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

async function resizeImageBeforeUpload(
  file: File,
  opts: ResizeOptions = {}
): Promise<Blob> {
  const { maxWidth = 1920, maxHeight = 1440, quality = 0.85 } = opts;

  // Nếu là GIF, bỏ qua resize để giữ animation
  if (file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context không khả dụng'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        const targetType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('toBlob thất bại'))),
          targetType,
          quality
        );
      };
      img.onerror = () => reject(new Error('Không đọc được ảnh'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Lỗi đọc file'));
    reader.readAsDataURL(file);
  });
}

// ============================================================
//  UPLOAD TO CLOUDINARY
// ============================================================

export interface CloudinaryUploadResult {
  ok: true;
  url: string;            // URL gốc (full size)
  secureUrl: string;      // HTTPS URL
  publicId: string;       // ID trong Cloudinary
  format: string;
  width: number;
  height: number;
  bytes: number;
  // URL biến đổi sẵn để dùng luôn
  thumbnailUrl: string;   // 300x300
  optimizedUrl: string;   // 1200x900, q=auto, f=auto
}

export interface CloudinaryUploadError {
  ok: false;
  error: string;
  fallbackDataUrl?: string; // base64 để dùng tạm nếu có
}

export type UploadResult = CloudinaryUploadResult | CloudinaryUploadError;

export async function uploadImageToCloudinary(
  file: File,
  options: { folder?: string; tags?: string[] } = {}
): Promise<UploadResult> {
  if (!isCloudinaryConfigured()) {
    // Fallback: vẫn trả base64 để không vỡ UX
    return {
      ok: false,
      error: 'Cloudinary chưa cấu hình. Xem .env.example (VITE_USE_CLOUDINARY_UPLOAD, VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET).',
      fallbackDataUrl: await fileToDataUrl(file),
    };
  }

  // 1. Validate
  const validation = validateImageFile(file);
  if (validation.ok === false) {
    return { ok: false, error: validation.error };
  }

  // 2. Resize trước khi upload (giảm bandwidth + storage)
  let blob: Blob;
  try {
    blob = await resizeImageBeforeUpload(file);
  } catch (err) {
    return {
      ok: false,
      error: 'Lỗi xử lý ảnh: ' + (err instanceof Error ? err.message : String(err)),
      fallbackDataUrl: await fileToDataUrl(file),
    };
  }

  // 3. Upload
  const formData = new FormData();
  formData.append('file', blob, file.name);
  formData.append('upload_preset', UPLOAD_PRESET!);
  if (options.folder) formData.append('folder', `lumidesign/${options.folder}`);
  if (options.tags?.length) formData.append('tags', options.tags.join(','));

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );

    if (!response.ok) {
      const errText = await response.text();
      return {
        ok: false,
        error: `Cloudinary HTTP ${response.status}: ${errText.substring(0, 200)}`,
        fallbackDataUrl: await fileToDataUrl(file),
      };
    }

    const data = await response.json();
    return {
      ok: true,
      url: data.url,
      secureUrl: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      width: data.width,
      height: data.height,
      bytes: data.bytes,
      thumbnailUrl: cloudinaryUrl(data.public_id, { w: 300, h: 300, crop: 'fill', q: 'auto', f: 'auto' }),
      optimizedUrl: cloudinaryUrl(data.public_id, { w: 1200, h: 900, crop: 'limit', q: 'auto', f: 'auto' }),
    };
  } catch (err) {
    return {
      ok: false,
      error: 'Không kết nối được Cloudinary: ' + (err instanceof Error ? err.message : String(err)),
      fallbackDataUrl: await fileToDataUrl(file),
    };
  }
}

// ============================================================
//  URL BUILDER (tạo URL biến đổi từ publicId đã upload)
// ============================================================

export interface CloudinaryTransform {
  w?: number;          // width
  h?: number;          // height
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'limit' | 'pad';
  q?: 'auto' | number; // quality
  f?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  dpr?: 'auto' | number; // device pixel ratio
}

export function cloudinaryUrl(publicId: string, t: CloudinaryTransform = {}): string {
  if (!CLOUD_NAME) return '';
  const params = [
    t.w && `w_${t.w}`,
    t.h && `h_${t.h}`,
    t.crop && `c_${t.crop}`,
    t.q && `q_${t.q}`,
    t.f && `f_${t.f}`,
    t.dpr && `dpr_${t.dpr}`,
  ].filter(Boolean).join(',');

  const transforms = params ? `${params}/` : '';
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}${publicId}`;
}

/**
 * Alias cho cloudinaryUrl - dùng fit thay cho crop (Cloudinary chấp nhận cả 2)
 */
export function cloudinaryFitUrl(publicId: string, t: { w?: number; h?: number; fit?: 'limit' | 'fill' | 'pad' } = {}): string {
  return cloudinaryUrl(publicId, { w: t.w, h: t.h, crop: t.fit });
}

// ============================================================
//  FALLBACK - base64 (giữ để tương thích code cũ)
// ============================================================

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Lỗi đọc file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Wrapper tương thích với processImageFileToDataUrl cũ.
 * - Nếu Cloudinary OK: upload lên CDN, trả về URL string (không phải data: prefix)
 * - Nếu Cloudinary lỗi: fallback về data URL
 *
 * Code cũ chỉ cần đổi: import { processImageFileToDataUrl } from './cloudinaryUpload';
 */
export async function processImageFileToDataUrl(file: File): Promise<string> {
  const result = await uploadImageToCloudinary(file);
  if (result.ok === true) {
    return result.optimizedUrl;
  }
  console.warn('[cloudinaryUpload] Fallback to base64:', result.error);
  return result.fallbackDataUrl || '';
}

// ============================================================
//  DELETE IMAGE (optional - cần API key, mặc định unsigned không xóa được)
// ============================================================

/**
 * Xóa ảnh đã upload. CẢNH BÁO: cần signed upload preset + API key ở backend.
 * Cloudinary unsigned KHÔNG cho phép xóa từ client.
 * -> Trong production, cần backend endpoint để xóa an toàn.
 *
 * Hàm này chỉ log warning, không làm gì.
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<boolean> {
  console.warn(
    `[cloudinaryUpload] deleteImageFromCloudinary("${publicId}") không khả dụng từ client. Cần backend.`
  );
  return false;
}

// ============================================================
//  HEALTH CHECK
// ============================================================

export async function checkCloudinaryHealth(): Promise<{
  ok: boolean;
  message: string;
}> {
  if (!USE_CLOUDINARY) {
    return { ok: true, message: 'Đang dùng base64 (VITE_USE_CLOUDINARY_UPLOAD=false)' };
  }
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    return { ok: false, message: 'Thiếu CLOUD_NAME hoặc UPLOAD_PRESET' };
  }

  // Test với 1 request GET đến API cloud name
  try {
    const res = await fetch(`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/sample.jpg`, {
      method: 'HEAD',
    });
    if (res.ok || res.status === 404) {
      // 404 = cloud name tồn tại nhưng 'sample' không có; vẫn coi là OK
      return { ok: true, message: 'Cloudinary reachable' };
    }
    return { ok: false, message: `Cloudinary HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, message: 'Không kết nối được Cloudinary' };
  }
}
