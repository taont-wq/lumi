/**
 * Supabase Storage helper — upload ảnh 3D, video thumbnails, project banners.
 *
 * Buckets (tạo trong Supabase Dashboard > Storage):
 *   - apartment-images  (public, ảnh 3D căn hộ)
 *   - apartment-videos  (public, video thumbnail)
 *   - project-banners   (public, banner dự án)
 *
 * Thay thế `cloudinaryUpload.ts` cũ (Quick Wins).
 * Ưu điểm:
 *   - Không phụ thuộc Cloudinary account
 *   - Dùng chung Supabase project → đơn giản hóa
 *   - Có CDN + cache tự động
 */

import { supabase, isSupabaseEnabled } from '../lib/supabase';

export type StorageBucket = 'apartment-images' | 'apartment-videos' | 'project-banners';

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Upload file lên Supabase Storage.
 * Trả về public URL (string) nếu thành công, throw Error nếu thất bại.
 *
 * @param file - File object từ <input type="file">
 * @param bucket - bucket name
 * @param folder - folder con trong bucket (vd: 'apt-123' cho căn hộ có id=123)
 * @returns public URL của file đã upload
 */
export async function uploadFile(
  file: File,
  bucket: StorageBucket,
  folder: string = 'misc'
): Promise<string> {
  if (!isSupabaseEnabled() || !supabase) {
    throw new Error('Supabase chưa được cấu hình.');
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(`Định dạng file không hỗ trợ: ${file.type}. Chỉ chấp nhận JPG, PNG, WEBP, GIF.`);
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error(`File quá lớn: ${(file.size / 1024 / 1024).toFixed(1)}MB. Tối đa ${MAX_FILE_SIZE_MB}MB.`);
  }

  // Tạo tên file unique: timestamp + random + extension
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${folder}/${filename}`;

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600', // cache 1 giờ
    upsert: false,
  });

  if (error) {
    throw new Error(`Upload thất bại: ${error.message}`);
  }
  if (!data?.path) {
    throw new Error('Upload thất bại: Không nhận được path.');
  }

  // Lấy public URL
  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrlData.publicUrl;
}

/**
 * Upload ảnh 3D cho căn hộ.
 * Convenience wrapper: bucket = 'apartment-images', folder = apartmentId.
 */
export async function uploadApartmentImage(
  file: File,
  apartmentId: string
): Promise<string> {
  return uploadFile(file, 'apartment-images', `apt-${apartmentId}`);
}

/**
 * Upload banner cho dự án.
 */
export async function uploadProjectBanner(
  file: File,
  projectId: string
): Promise<string> {
  return uploadFile(file, 'project-banners', `proj-${projectId}`);
}

/**
 * Xoá file trong Storage (admin only).
 * @param bucket
 * @param path - path đầy đủ trong bucket (lấy từ URL)
 */
export async function deleteFile(bucket: StorageBucket, path: string): Promise<void> {
  if (!isSupabaseEnabled() || !supabase) {
    throw new Error('Supabase chưa được cấu hình.');
  }
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    throw new Error(`Xoá file thất bại: ${error.message}`);
  }
}

/**
 * Extract path từ public URL.
 * Ví dụ: https://xxx.supabase.co/storage/v1/object/public/apartment-images/folder/file.jpg
 *      → "folder/file.jpg"
 */
export function extractStoragePath(publicUrl: string, bucket: StorageBucket): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}
