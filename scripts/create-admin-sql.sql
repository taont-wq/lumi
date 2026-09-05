-- ================================================================
-- TẠO ADMIN USER TRONG SUPABASE (chạy trong SQL Editor)
-- ================================================================
-- Mở Supabase Dashboard → SQL Editor → paste đoạn này → Run

-- 1. Tạo admin user (ON CONFLICT = cập nhật nếu đã tồn tại)
-- LƯU Ý: Supabase mới dùng "app_metadata" thay vì "raw_app_metadata"
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, app_metadata, role, aud, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@noithatlumi.vn',
  crypt('Admin@123', gen_salt('bf')),
  NOW(),
  '{"role": "admin"}'::jsonb,
  'authenticated',
  'signup',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  encrypted_password = crypt('Admin@123', gen_salt('bf')),
  app_metadata = '{"role": "admin"}'::jsonb,
  email_confirmed_at = NOW(),
  updated_at = NOW();

-- 2. Xác nhận user đã có role admin
SELECT id, email, app_metadata, role, aud, email_confirmed_at
FROM auth.users
WHERE email = 'admin@noithatlumi.vn';

-- 3. Verify RLS policy is_admin() hoạt động
SELECT is_admin();
-- Kết quả phải là: true
