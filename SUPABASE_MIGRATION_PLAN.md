# Supabase Migration Plan — tra-cuu-can-ho-mau-noi-that-3d

> Mục tiêu: Xoá localStorage, dùng Supabase (Postgres + Auth + Storage) làm DB độc lập. Tách admin thành route `/admin` (Cách A).

## Quyết định đã chốt (từ user)

| # | Quyết định | Lựa chọn |
|---|---|---|
| 1 | Backend | **Supabase** (Postgres + Auth + Storage) |
| 2 | Admin site | **Cách A** — Subpath `/admin` cùng React app |
| 3 | Data migrate | **Tất cả** 5 bảng (projects, apartments, leads, settings, adminSession) |
| 4 | Ảnh 3D | **Option 2** — Upload Supabase Storage, lưu URL trong DB |
| 5 | Public user | **Option 1** — Không cần đăng nhập (RLS anonymous) |

## Kế hoạch chi tiết (5-7 ngày)

### Giai đoạn 1 — Setup Supabase (1-2 ngày)
- [ ] Tạo project Supabase (free tier)
- [ ] Tạo schema SQL: 5 tables + RLS policies
- [ ] Tạo Storage buckets: `apartment-images`, `apartment-videos`, `project-banners`
- [ ] Tạo admin user đầu tiên
- [ ] Cấu hình env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

### Giai đoạn 2 — Code layer (3-4 ngày)
- [ ] Cài `npm i @supabase/supabase-js`
- [ ] Tạo `src/lib/supabase.ts` (client singleton + types)
- [ ] Viết service layer mới: `supabaseStorage.ts` thay thế `storageService.ts`
- [ ] Tạo `src/lib/auth.ts` (Supabase Auth wrapper)
- [ ] Cập nhật `App.tsx`: dùng React Router, route `/admin` riêng
- [ ] Tạo `src/pages/AdminLoginPage.tsx`
- [ ] Tạo `src/pages/AdminDashboardPage.tsx` (extract từ `AdminPortal.tsx`)
- [ ] Tạo `src/components/RouteGuard.tsx` (check auth cho /admin)
- [ ] Refactor image upload dùng Supabase Storage

### Giai đoạn 3 — Migration data (1 ngày)
- [ ] Viết `src/services/migrateLocalToSupabase.ts`
- [ ] Chạy 1 lần để đẩy data từ localStorage lên Supabase
- [ ] Xoá localStorage sau khi xác nhận thành công

### Giai đoạn 4 — Test & Deploy (1-2 ngày)
- [ ] Test CRUD toàn bộ
- [ ] Test admin login + logout
- [ ] Test public không cần login
- [ ] Test upload ảnh lên Storage
- [ ] Deploy lên Vercel với env vars mới
- [ ] Verify production

## Schema SQL (dự kiến)

```sql
-- 1. Bảng projects
CREATE TABLE projects (
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
CREATE TABLE apartments (
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

-- 3. Bảng leads
CREATE TABLE leads (
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
  status TEXT DEFAULT 'new',
  synced_to_google_sheet BOOLEAN DEFAULT false
);

-- 4. Bảng settings (singleton — chỉ 1 row)
CREATE TABLE settings (
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

-- 5. Bảng audit_log (optional, dùng cho admin tracking)
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Public có thể đọc (anon)
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read apartments" ON apartments FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);

-- Public có thể tạo lead (insert)
CREATE POLICY "Public insert leads" ON leads FOR INSERT WITH CHECK (true);

-- Chỉ admin mới được ghi (write/update/delete)
CREATE POLICY "Admin full access projects" ON projects FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
-- (Tương tự cho apartments, settings)

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('apartment-images', 'apartment-images', true),
  ('apartment-videos', 'apartment-videos', true),
  ('project-banners', 'project-banners', true);
```

## Cấu trúc thư mục mới

```
src/
  lib/
    supabase.ts              # Client singleton
    auth.ts                  # Supabase Auth wrapper
  pages/
    PublicHomePage.tsx       # Trang public (hiện tại là App.tsx)
    AdminLoginPage.tsx       # /admin/login
    AdminDashboardPage.tsx   # /admin (sau login)
    NotFoundPage.tsx         # 404
  components/
    RouteGuard.tsx           # Check auth cho admin routes
    PublicLayout.tsx         # Layout cho public (Navbar + Footer)
    AdminLayout.tsx          # Layout cho admin (sidebar, header riêng)
  services/
    supabaseStorage.ts       # CRUD thay storageService
    migrateLocalToSupabase.ts # Migration 1 lần
    ...
```

## Rủi ro & giảm thiểu

| Rủi ro | Giảm thiểu |
|---|---|
| Supabase project bị xoá / data mất | Backup tự động hàng tuần (Supabase free có 7-day backup) |
| RLS policy sai → lộ data | Test kỹ với anon key + role admin trước deploy |
| Storage URL thay đổi (Supabase đổi domain) | Hard-code domain, dùng CDN nếu cần |
| Auth migration từ SHA-256 hash → Supabase | Set password mới cho admin đầu tiên, bỏ hash cũ |
| 5-7 ngày dài quá | Có thể làm GĐ1-2 trước (2-3 ngày), đủ dùng |

## Bước tiếp theo

1. Bạn tạo tài khoản Supabase (https://supabase.com) → tạo project mới
2. Cung cấp cho tôi: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (sẽ dùng env var, không hard-code)
3. Tôi viết SQL schema + chạy trong Supabase SQL Editor
4. Tôi bắt đầu code theo từng giai đoạn
