/**
 * Migration script: chuyển data từ localStorage sang Supabase.
 *
 * Chạy 1 LẦN DUY NHẤT sau khi setup Supabase thành công.
 * Sau khi chạy xong, xoá localStorage để buộc app đọc từ Supabase.
 *
 * Cách chạy:
 *   1. Mở app ở local với localStorage cũ (chưa có Supabase data)
 *   2. Mở Console (F12) và chạy:
 *        import('./services/migrateLocalToSupabase').then(m => m.runMigration());
 *   3. Đợi log "Migration completed!"
 *   4. Reload trang → app sẽ tự đọc từ Supabase
 *   5. Verify: vào /admin, kiểm tra data đã có chưa
 *   6. Xoá localStorage cũ:
 *        localStorage.clear(); location.reload();
 */

import { ApartmentUnit, AppSettings, LeadRecord, Project } from '../types';
import { supabase, isSupabaseEnabled } from '../lib/supabase';
import { saveStoredProjects, saveStoredApartments, saveStoredLeads, saveStoredSettings } from './supabaseStorage';
import { getStoredProjects, getStoredApartments, getStoredLeads, getStoredSettings } from './storageService';

const LOG_PREFIX = '[Migration]';

export async function runMigration(): Promise<void> {
  console.log(`${LOG_PREFIX} Bắt đầu migration từ localStorage → Supabase...`);

  if (!isSupabaseEnabled() || !supabase) {
    console.error(`${LOG_PREFIX} Supabase chưa được cấu hình! Kiểm tra VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY.`);
    return;
  }

  try {
    // 1. Đọc data từ localStorage
    const localProjects = await getStoredProjects();
    const localApartments = await getStoredApartments();
    const localLeads = await getStoredLeads();
    const localSettings = await getStoredSettings();

    console.log(`${LOG_PREFIX} localStorage có:`);
    console.log(`  - ${localProjects.length} projects`);
    console.log(`  - ${localApartments.length} apartments`);
    console.log(`  - ${localLeads.length} leads`);
    console.log(`  - settings: ${localSettings ? 'có' : 'không'}`);

    // 2. Đẩy lên Supabase
    if (localProjects.length > 0) {
      console.log(`${LOG_PREFIX} Đang đẩy ${localProjects.length} projects...`);
      await saveStoredProjects(localProjects);
    }
    if (localApartments.length > 0) {
      console.log(`${LOG_PREFIX} Đang đẩy ${localApartments.length} apartments...`);
      await saveStoredApartments(localApartments);
    }
    if (localLeads.length > 0) {
      console.log(`${LOG_PREFIX} Đang đẩy ${localLeads.length} leads...`);
      await saveStoredLeads(localLeads);
    }
    if (localSettings) {
      console.log(`${LOG_PREFIX} Đang đẩy settings...`);
      // Xoá hash mật khẩu cũ — dùng Supabase Auth
      const cleanSettings = { ...localSettings, adminPasswordHash: undefined };
      await saveStoredSettings(cleanSettings);
    }

    console.log(`${LOG_PREFIX} ✅ Migration completed!`);
    console.log(`${LOG_PREFIX} Bước tiếp theo:`);
    console.log(`  1. Reload trang`);
    console.log(`  2. Vào /admin, đăng nhập bằng Supabase Auth`);
    console.log(`  3. Nếu OK, chạy: localStorage.clear(); location.reload();`);
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ Migration thất bại:`, error);
    throw error;
  }
}

// Expose to window cho dễ gọi từ Console
if (typeof window !== 'undefined') {
  (window as any).runMigration = runMigration;
}
