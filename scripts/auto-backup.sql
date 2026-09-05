-- ================================================================
-- AUTO BACKUP HẸN GIỜ — Lumi (pg_cron, zero code app)
-- ================================================================
-- Chạy 1 lần trong Supabase Dashboard > SQL Editor (quyền owner).
-- Sau đó mỗi tuần tự chụp toàn bộ 4 bảng, giữ 8 bản gần nhất.
-- Không sửa auth.users, không đụng RLS hiện tại.
-- ================================================================

-- BƯỚC 0: Bật extension pg_cron (nếu báo lỗi thì bật tay:
-- Dashboard > Database > Extensions > gạt pg_cron ON rồi chạy lại từ Bước 1)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- BƯỚC 1: Bảng chứa bản backup (mỗi dòng = 1 lần chụp)
CREATE TABLE IF NOT EXISTS public.backup_runs (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  projects JSONB NOT NULL DEFAULT '[]',
  apartments JSONB NOT NULL DEFAULT '[]',
  leads JSONB NOT NULL DEFAULT '[]',
  settings JSONB NOT NULL DEFAULT '[]'
);

-- Chỉ admin được đọc backup
ALTER TABLE public.backup_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access backup_runs" ON public.backup_runs;
CREATE POLICY "Admin full access backup_runs" ON public.backup_runs
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- BƯỚC 2: Xóa job cũ nếu chạy lại script (tránh trùng lịch)
DO $$ BEGIN
  PERFORM cron.unschedule('lumi-weekly-backup');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- BƯỚC 3: Hẹn giờ — 02:00 UTC Chủ Nhật hàng tuần (= 09:00 sáng CN giờ VN)
SELECT cron.schedule(
  'lumi-weekly-backup',
  '0 2 * * 0',
  $$
  INSERT INTO public.backup_runs (projects, apartments, leads, settings)
  SELECT
    (SELECT COALESCE(jsonb_agg(p), '[]'::jsonb) FROM public.projects p),
    (SELECT COALESCE(jsonb_agg(a), '[]'::jsonb) FROM public.apartments a),
    (SELECT COALESCE(jsonb_agg(l), '[]'::jsonb) FROM public.leads l),
    (SELECT COALESCE(jsonb_agg(s), '[]'::jsonb) FROM public.settings s);
  DELETE FROM public.backup_runs
  WHERE id NOT IN (SELECT id FROM public.backup_runs ORDER BY created_at DESC LIMIT 8);
  $$
);

-- BƯỚC 4: Chụp 1 bản NGAY để test (không chờ tới Chủ Nhật)
INSERT INTO public.backup_runs (projects, apartments, leads, settings)
SELECT
  (SELECT COALESCE(jsonb_agg(p), '[]'::jsonb) FROM public.projects p),
  (SELECT COALESCE(jsonb_agg(a), '[]'::jsonb) FROM public.apartments a),
  (SELECT COALESCE(jsonb_agg(l), '[]'::jsonb) FROM public.leads l),
  (SELECT COALESCE(jsonb_agg(s), '[]'::jsonb) FROM public.settings s);

-- BƯỚC 5: VERIFY — phải ra 1 dòng, job đang scheduled
SELECT id, created_at,
  jsonb_array_length(projects) AS projects,
  jsonb_array_length(apartments) AS apartments,
  jsonb_array_length(leads) AS leads,
  jsonb_array_length(settings) AS settings
FROM public.backup_runs ORDER BY created_at DESC LIMIT 5;
SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'lumi-weekly-backup';

-- ================================================================
-- KHÔI PHỤC KHI CẦN (chạy tay từng khối, theo thứ tự projects trước)
-- ================================================================
-- -- 1. Khôi phục settings + projects (không có FK ràng buộc vào)
-- INSERT INTO public.settings SELECT * FROM jsonb_populate_recordset(null::public.settings, (SELECT settings FROM public.backup_runs ORDER BY created_at DESC LIMIT 1)) ON CONFLICT (id) DO UPDATE SET brand_name = EXCLUDED.brand_name, slogan = EXCLUDED.slogan, hotline = EXCLUDED.hotline, hotline2 = EXCLUDED.hotline2, zalo_number = EXCLUDED.zalo_number, zalo_link = EXCLUDED.zalo_link, address = EXCLUDED.address, address_showroom = EXCLUDED.address_showroom, address_vpgd = EXCLUDED.address_vpgd, email = EXCLUDED.email, facebook_url = EXCLUDED.facebook_url, google_sheet_webhook_url = EXCLUDED.google_sheet_webhook_url, auto_sync_google_sheet = EXCLUDED.auto_sync_google_sheet, hero_headline = EXCLUDED.hero_headline, hero_subheadline = EXCLUDED.hero_subheadline;
-- INSERT INTO public.projects SELECT * FROM jsonb_populate_recordset(null::public.projects, (SELECT projects FROM public.backup_runs ORDER BY created_at DESC LIMIT 1)) ON CONFLICT (id) DO NOTHING;
-- -- 2. Khôi phục apartments (FK vào projects nên chạy sau)
-- INSERT INTO public.apartments SELECT * FROM jsonb_populate_recordset(null::public.apartments, (SELECT apartments FROM public.backup_runs ORDER BY created_at DESC LIMIT 1)) ON CONFLICT (id) DO NOTHING;
-- -- 3. Khôi phục leads
-- INSERT INTO public.leads SELECT * FROM jsonb_populate_recordset(null::public.leads, (SELECT leads FROM public.backup_runs ORDER BY created_at DESC LIMIT 1)) ON CONFLICT (id) DO NOTHING;
--
-- HỦY lịch backup (khi không cần nữa):
-- SELECT cron.unschedule('lumi-weekly-backup');
-- ================================================================
