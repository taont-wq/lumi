-- ================================================================
-- SEED DATA NO-IMAGES — Lumi (chạy trong Supabase SQL Editor)
-- Chỉ dữ liệu chữ/số, KHÔNG hình ảnh / PDF / video
-- Chạy sau SUPABASE_SCHEMA.sql
-- Không động tới auth.users
-- ================================================================

-- 1. SETTINGS singleton id=1 (fix lỗi 406 + crash hotline)
INSERT INTO settings (
  id, brand_name, slogan, hotline, hotline2,
  zalo_number, zalo_link, address, address_showroom, address_vpgd,
  email, facebook_url, google_sheet_webhook_url, auto_sync_google_sheet,
  hero_headline, hero_subheadline
) VALUES (
  1,
  'Lumi Design',
  'Tra cuu kich thuoc chi tiet can ho, so do mat bang & mau noi that 3D - noithatlumi.vn',
  '058 929 4444',
  '083 555 7878',
  '0589294444',
  'https://zalo.me/0589294444',
  'Showroom: Shop chan de Zurich 1, Vinhomes Ocean Park',
  'Shop chan de Zurich 1, Vinhomes Ocean Park',
  ARRAY['ZR1 0311, toa ZR1, Vinhomes Ocean Park','Toa SA5, The Sakura, Vinhomes Smart City','Toa SF3, Skyforest, Ecopark'],
  'noithatlumidesign@gmail.com',
  'https://www.facebook.com/noithatlumidesign',
  '',
  true,
  'Tra Cuu Kich Thuoc Chi Tiet Can Ho & Mau Noi That 3D',
  'Cong cu tra cuu ky thuat & noi that 3D chinh thuc tu Lumi Design'
)
ON CONFLICT (id) DO UPDATE SET
  brand_name = EXCLUDED.brand_name,
  slogan = EXCLUDED.slogan,
  hotline = EXCLUDED.hotline,
  hotline2 = EXCLUDED.hotline2,
  zalo_number = EXCLUDED.zalo_number,
  zalo_link = EXCLUDED.zalo_link,
  address = EXCLUDED.address,
  address_showroom = EXCLUDED.address_showroom,
  address_vpgd = EXCLUDED.address_vpgd,
  email = EXCLUDED.email,
  facebook_url = EXCLUDED.facebook_url,
  hero_headline = EXCLUDED.hero_headline,
  hero_subheadline = EXCLUDED.hero_subheadline;

-- 2. PROJECTS 5 rows, banner_url = '' (no images)
INSERT INTO projects (id, name, slug, location, developer, total_units, banner_url, towers, available_unit_types, description) VALUES
('proj-vh-oceanpark', 'Vinhomes Ocean Park 1', 'vinhomes-ocean-park-1', 'Da Ton, Gia Lam, Ha Noi', 'Vingroup', '66 Toa', '', ARRAY['S1.01','S1.02','S1.03','S1.05','S1.06','S1.07','S1.08','S1.09','S1.10','S1.11','S1.12','S2.01','S2.02','S2.03','S2.05','S2.08','S2.10','S2.15','S2.18','Zen Park R1.01','Pavilion P1'], ARRAY['studio','1pn','1pn_plus','2pn_1wc','2pn_2wc','3pn'], 'Dai do thi bien ho 420ha.'),
('proj-masteri-centre-point', 'Masteri Centre Point (Grand Park)', 'masteri-centre-point', 'Nguyen Xien, Long Thanh My, Thu Duc', 'Masterise Homes', '10 Toa', '', ARRAY['Thap A - Riviera','Thap B - Riviera','Thap C - Riviera','Thap D - Riviera','Thap E - Riviera','Thap A - Lumiere','Thap B - Lumiere'], ARRAY['1pn','1pn_plus','2pn_2wc','3pn','duplex'], 'Khu can ho compound biet lap.'),
('proj-vh-smartcity', 'Vinhomes Smart City', 'vinhomes-smart-city', 'Tay Mo - Dai Mo, Nam Tu Liem, Ha Noi', 'Vingroup', '58 Toa', '', ARRAY['S1.01','S1.02','S2.01','S2.02','S3.01','S4.01','S4.02','The Tonkin TK1','The Tonkin TK2','The Sakura SA2','The Miami GS1'], ARRAY['studio','1pn','1pn_plus','2pn_1wc','2pn_2wc','3pn'], 'Thanh pho quoc te phia Tay Ha Noi.'),
('proj-the-beverly', 'The Beverly - Vinhomes Grand Park', 'the-beverly-grand-park', 'Phuoc Thien, Long Binh, Thu Duc', 'Vingroup & Mitsubishi', '10 Toa', '', ARRAY['The Star BE1','The Star BE2','The Star BE3','The Resort BE5','The Resort BE6','The Resort BE7'], ARRAY['studio','1pn_plus','2pn_2wc','3pn'], 'Phan khu nghi duong phong cach My.'),
('proj-ecopark-sky-oasis', 'Ecopark Sky Oasis & Haven Park', 'ecopark-sky-oasis', 'Van Giang, Hung Yen', 'Tap doan Ecopark', '4 Thap 41 tang', '', ARRAY['Thap S1','Thap S2','Thap S3','Thap S-Premium','Haven Park H1','Haven Park H2'], ARRAY['studio','1pn','2pn_2wc','3pn','duplex'], 'Toa thap bieu tuong resort.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  location = EXCLUDED.location,
  developer = EXCLUDED.developer,
  total_units = EXCLUDED.total_units,
  banner_url = EXCLUDED.banner_url,
  towers = EXCLUDED.towers,
  available_unit_types = EXCLUDED.available_unit_types,
  description = EXCLUDED.description;

-- 3. APARTMENTS 6 rows, strip all images/PDF/video -> NULL / []
INSERT INTO apartments (
  id, project_id, project_name, unit_code, axis_number,
  unit_type, unit_type_name, tower, floor_range,
  gross_area, net_area, ceiling_height, direction,
  floor_plan_image_url, floor_plan_pdf_url, cad_download_url, interior_catalogue_pdf_url,
  description, highlights,
  room_dimensions, interior_images, videos, estimated_cost_range
) VALUES
('apt-vh-ocp-2pn2wc-08','proj-vh-oceanpark','Vinhomes Ocean Park 1','S2.05-12A08','Truc 08','2pn_2wc','2 Phong Ngu + 2WC (Goc)','S2.05','Tang 6 - 26 (Can so 08)',69.2,63.8,2.85,'Cua Tay Nam, ban cong Dong Bac view Bien Ho',NULL,NULL,NULL,NULL,'Can 2PN+2WC goc 2 mat thoang.','{}','[]','[]','[]',NULL),
('apt-vh-ocp-1pnplus-12','proj-vh-oceanpark','Vinhomes Ocean Park 1','S1.08-1512','Truc 12','1pn_plus','1 Phong Ngu + 1 (Da Nang)','S1.08','Tang 5 - 28 (Can so 12)',48.5,43.2,2.85,'Cua Dong Bac, ban cong Tay Nam',NULL,NULL,NULL,NULL,'Can 1PN+1 linh hoat lam viec / ngu phu.','{}','[]','[]','[]',NULL),
('apt-vh-ocp-2pn1wc-05a','proj-vh-oceanpark','Vinhomes Ocean Park 1','S1.02-0805A','Truc 05A','2pn_1wc','2 Phong Ngu - 1WC','S1.02','Tang 4 - 26 (Can so 05A)',60.5,55.4,2.85,'Cua Tay Bac, ban cong Dong Nam',NULL,NULL,NULL,NULL,'Can 2PN-1WC vuong vuc, toi uu chi phi.','{}','[]','[]','[]',NULL),
('apt-masteri-2pn-b06','proj-masteri-centre-point','Masteri Centre Point (Grand Park)','B06-2PN','Truc B06','2pn_2wc','2 Phong Ngu 2WC','Thap B - Riviera','Tang trung',68.0,62.0,2.80,'Ban cong Dong Nam',NULL,NULL,NULL,NULL,'Can 2PN compound cao cap.','{}','[]','[]','[]',NULL),
('apt-smartcity-3pn-tk02','proj-vh-smartcity','Vinhomes Smart City','TK02-3PN','Truc TK02','3pn','3 Phong Ngu','The Tonkin TK1','Tang cao',95.0,88.0,2.85,'View noi khu',NULL,NULL,NULL,NULL,'Can 3PN gia dinh dong nguoi.','{}','[]','[]','[]',NULL),
('apt-beverly-studio-05','proj-the-beverly','The Beverly - Vinhomes Grand Park','BE05-STU','Truc 05','studio','Studio','The Star BE1','Tang trung',32.0,28.5,2.80,'View cong vien',NULL,NULL,NULL,NULL,'Studio nghi duong.','{}','[]','[]','[]',NULL)
ON CONFLICT (id) DO UPDATE SET
  project_id = EXCLUDED.project_id,
  project_name = EXCLUDED.project_name,
  unit_code = EXCLUDED.unit_code,
  tower = EXCLUDED.tower,
  gross_area = EXCLUDED.gross_area,
  net_area = EXCLUDED.net_area,
  direction = EXCLUDED.direction,
  description = EXCLUDED.description;

-- 4. VERIFY (chỉ SELECT, không sửa user)
SELECT 'projects' AS tbl, count(*) FROM projects
UNION ALL SELECT 'apartments', count(*) FROM apartments
UNION ALL SELECT 'settings', count(*) FROM settings;
SELECT id, brand_name, hotline FROM settings WHERE id = 1;
SELECT is_admin();
