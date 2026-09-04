-- ================================================================
-- SUPABASE SCHEMA — Lumidesign (tra-cuu-can-ho-mau-noi-that-3d)
-- ================================================================
-- Chạy file này trong Supabase Dashboard > SQL Editor > New Query
-- Chạy theo thứ tự: phần 1 (tables) trước, phần 2 (RLS) sau
-- ================================================================

-- ================================================================
-- PHẦN 1: TẠO BẢNG
-- ================================================================

-- 1. Bảng projects
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  location TEXT,
  developer TEXT,
  total_units TEXT,
  banner_url TEXT,
  towers TEXT[] DEFAULT '{}',
  available_unit_types TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng apartments
CREATE TABLE IF NOT EXISTS apartments (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  project_name TEXT,
  unit_code TEXT NOT NULL,
  axis_number TEXT,
  unit_type TEXT,
  unit_type_name TEXT,
  tower TEXT,
  floor_range TEXT,
  gross_area NUMERIC,
  net_area NUMERIC,
  ceiling_height NUMERIC,
  direction TEXT,
  floor_plan_image_url TEXT,
  floor_plan_pdf_url TEXT,
  cad_download_url TEXT,
  interior_catalogue_pdf_url TEXT,
  description TEXT,
  highlights TEXT[] DEFAULT '{}',
  room_dimensions JSONB DEFAULT '[]'::jsonb,
  interior_images JSONB DEFAULT '[]'::jsonb,
  videos JSONB DEFAULT '[]'::jsonb,
  estimated_cost_range JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng leads (CRM)
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  project_id TEXT,
  project_name TEXT,
  unit_code TEXT,
  unit_type TEXT,
  action TEXT,
  action_name TEXT,
  note TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'consulting', 'completed')),
  synced_to_google_sheet BOOLEAN DEFAULT false
);

-- Index để query leads theo status nhanh
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- 4. Bảng settings (singleton — chỉ 1 row với id=1)
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  brand_name TEXT,
  slogan TEXT,
  hotline TEXT,
  hotline2 TEXT,
  zalo_number TEXT,
  zalo_link TEXT,
  address TEXT,
  address_showroom TEXT,
  address_vpgd TEXT[] DEFAULT '{}',
  email TEXT,
  facebook_url TEXT,
  google_sheet_webhook_url TEXT,
  auto_sync_google_sheet BOOLEAN DEFAULT true,
  hero_headline TEXT,
  hero_subheadline TEXT,
  CONSTRAINT single_row CHECK (id = 1)
);

-- 5. Bảng audit_log (optional — tracking admin actions)
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- PHẦN 2: ROW-LEVEL SECURITY (RLS)
-- ================================================================

-- Bật RLS cho tất cả bảng
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- === Public (anon) có thể ĐỌC data công khai ===
CREATE POLICY "Public read projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Public read apartments" ON apartments
  FOR SELECT USING (true);

CREATE POLICY "Public read settings" ON settings
  FOR SELECT USING (true);

-- === Public (anon) có thể INSERT lead (form liên hệ) ===
CREATE POLICY "Public insert leads" ON leads
  FOR INSERT WITH CHECK (true);

-- Public KHÔNG được update/delete leads
-- (chỉ admin mới được làm việc này — xem bên dưới)

-- === Admin mới được WRITE/UPDATE/DELETE ===
-- Cách 1: Check qua user_metadata.role = 'admin' trong JWT
-- Lưu ý: phải set role = 'admin' cho user trong Supabase Dashboard > Auth > Users
--        (edit user → app_metadata → role = "admin")

-- Helper function: check current user có role admin không
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin',
      false
    )
  );
END;
$$;

-- === Apply is_admin() check cho write operations ===

CREATE POLICY "Admin full access projects" ON projects
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin full access apartments" ON apartments
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin read leads" ON leads
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admin update leads" ON leads
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin delete leads" ON leads
  FOR DELETE
  USING (is_admin());

CREATE POLICY "Admin full access settings" ON settings
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Audit log: chỉ admin mới đọc, mọi authenticated user có thể insert (auto logging)
CREATE POLICY "Admin read audit_log" ON audit_log
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Authenticated insert audit_log" ON audit_log
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ================================================================
-- PHẦN 3: STORAGE BUCKETS
-- ================================================================

-- Tạo 3 buckets public
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('apartment-images', 'apartment-images', true),
  ('apartment-videos', 'apartment-videos', true),
  ('project-banners', 'project-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Policy cho Storage: public đọc, admin ghi
-- (Lưu ý: storage.objects là bảng hệ thống)

-- Public read all buckets
CREATE POLICY "Public read apartment-images" ON storage.objects
  FOR SELECT
  USING (bucket_id IN ('apartment-images', 'apartment-videos', 'project-banners'));

-- Admin write all buckets
CREATE POLICY "Admin write apartment-images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id IN ('apartment-images', 'apartment-videos', 'project-banners')
    AND is_admin()
  );

CREATE POLICY "Admin update apartment-images" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id IN ('apartment-images', 'apartment-videos', 'project-banners')
    AND is_admin()
  );

CREATE POLICY "Admin delete apartment-images" ON storage.objects
  FOR DELETE
  USING (
    bucket_id IN ('apartment-images', 'apartment-videos', 'project-banners')
    AND is_admin()
  );

-- ================================================================
-- PHẦN 4: TẠO ADMIN USER ĐẦU TIÊN
-- ================================================================

-- Cách 1: Qua Dashboard UI (khuyến nghị)
--   1. Vào Supabase Dashboard > Authentication > Users > Add user
--   2. Email: admin@noithatlumi.vn
--   3. Password: [chọn mật khẩu mạnh]
--   4. Auto Confirm User: ON
--   5. Nhấn Create user
--   6. Sau khi tạo xong, click vào user vừa tạo
--   7. Tab "Raw App Meta Data" → paste JSON:
--      { "role": "admin" }
--   8. Save

-- Cách 2: Qua SQL (nếu muốn nhanh)
-- LƯU Ý: Thay 'admin@noithatlumi.vn' và 'YOUR_SECURE_PASSWORD' trước khi chạy

-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, role)
-- VALUES (
--   gen_random_uuid(),
--   'admin@noithatlumi.vn',
--   crypt('YOUR_SECURE_PASSWORD', gen_salt('bf')),
--   NOW(),
--   '{"role": "admin"}'::jsonb,
--   'authenticated'
-- );

-- ================================================================
-- PHẦN 5: SEED DATA MẪU (optional — chỉ chạy nếu muốn test)
-- ================================================================

-- INSERT INTO projects (id, name, location, developer, towers, available_unit_types, banner_url) VALUES
--   ('proj-1', 'Vinhomes Ocean Park', 'Gia Lâm, Hà Nội', 'Vinhomes', ARRAY['The Zurich', 'The Tokyo'], ARRAY['2pn_2wc', '3pn'], 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80'),
--   ('proj-2', 'Vinhomes Smart City', 'Tây Mỗ, Hà Nội', 'Vinhomes', ARRAY['The Sakura', 'The Miami'], ARRAY['studio', '2pn_2wc', '3pn'], 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80');

-- INSERT INTO settings (id, brand_name, slogan, hotline, zalo_number, zalo_link, address, email) VALUES
--   (1, 'Lumi Design', 'Tra cứu kích thước chi tiết căn hộ & mẫu nội thất 3D', '058 929 4444', '0589294444', 'https://zalo.me/0589294444', 'Vinhomes Ocean Park, Hà Nội', 'noithatlumidesign@gmail.com');

-- ================================================================
-- DONE
-- ================================================================
-- Sau khi chạy xong, kiểm tra:
--   1. Vào Table Editor → thấy 5 bảng
--   2. Vào Storage → thấy 3 buckets
--   3. Vào Authentication > Users → có admin user
--   4. Vào SQL Editor > Run query: SELECT * FROM projects; (phải chạy được)
-- ================================================================
