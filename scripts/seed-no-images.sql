-- ================================================================
-- SEED DATA NO-IMAGES — Lumi (chạy trong Supabase SQL Editor)
-- Toàn bộ chữ tiếng Việt CÓ DẤU đúng data gốc trong src/data/initialData.ts
-- Chỉ bỏ hình ảnh / PDF / CAD / video. Không động tới auth.users.
-- Chạy sau SUPABASE_SCHEMA.sql
-- ================================================================

-- 1. SETTINGS singleton id=1 (fix lỗi 406 + crash hotline)
-- LƯU Ý: giữ nguyên brand_name nếu bạn đã sửa (đừng ghi đè tên thương hiệu của bạn)
INSERT INTO settings (
  id, brand_name, slogan, hotline, hotline2,
  zalo_number, zalo_link, address, address_showroom, address_vpgd,
  email, facebook_url, google_sheet_webhook_url, auto_sync_google_sheet,
  hero_headline, hero_subheadline
) VALUES (
  1,
  'Lumi Design',
  'Tra cứu kích thước chi tiết căn hộ, sơ đồ mặt bằng & mẫu nội thất 3D - noithatlumi.vn',
  '058 929 4444',
  '083 555 7878',
  '0589294444',
  'https://zalo.me/0589294444',
  'Showroom: Shop chân đế Zurich 1, Vinhomes Ocean Park',
  'Shop chân đế Zurich 1, Vinhomes Ocean Park',
  ARRAY['ZR1 0311, tòa ZR1, Vinhomes Ocean Park','Tòa SA5, The Sakura, Vinhomes Smart City','Tòa SF3, Skyforest, Ecopark, Hưng Yên'],
  'noithatlumidesign@gmail.com',
  'https://www.facebook.com/noithatlumidesign',
  '',
  true,
  'Tra Cứu Kích Thước Chi Tiết Căn Hộ & Mẫu Nội Thất 3D',
  'Công cụ tra cứu kỹ thuật & nội thất 3D chính thức từ Lumi Design (noithatlumi.vn): Tải sơ đồ mặt bằng, đo đạc kích thước từng phòng, xem 500+ mẫu nội thất 3D và video bàn giao thực tế từng căn.'
)
ON CONFLICT (id) DO UPDATE SET
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

-- 2. PROJECTS 5 rows, banner_url = '' (không hình ảnh)
INSERT INTO projects (id, name, slug, location, developer, total_units, banner_url, towers, available_unit_types, description) VALUES
('proj-vh-oceanpark', 'Vinhomes Ocean Park 1', 'vinhomes-ocean-park-1', 'Đa Tốn, Gia Lâm, Hà Nội', 'Vingroup', '66 Tòa chung cư (Sapphire, Ruby, Zen Park, Pavilion)', '', ARRAY['S1.01','S1.02','S1.03','S1.05','S1.06','S1.07','S1.08','S1.09','S1.10','S1.11','S1.12','S2.01','S2.02','S2.03','S2.05','S2.08','S2.10','S2.15','S2.18','Zen Park R1.01','Pavilion P1'], ARRAY['studio','1pn','1pn_plus','2pn_1wc','2pn_2wc','3pn'], 'Đại đô thị biển hồ quy mô 420ha với đầy đủ tiện ích chuẩn quốc tế, hồ nước mặn 6.1ha, hồ ngọc trai 24.5ha.'),
('proj-masteri-centre-point', 'Masteri Centre Point (Grand Park)', 'masteri-centre-point', 'Đường Nguyễn Xiển, Long Thạnh Mỹ, TP. Thủ Đức, TP.HCM', 'Masterise Homes', '10 Tòa căn hộ compound cao cấp (5.094 căn)', '', ARRAY['Tháp A - Riviera','Tháp B - Riviera','Tháp C - Riviera','Tháp D - Riviera','Tháp E - Riviera','Tháp A - Lumière','Tháp B - Lumière'], ARRAY['1pn','1pn_plus','2pn_2wc','3pn','duplex'], 'Khu căn hộ compound biệt lập chuẩn quốc tế cao cấp nhất trung tâm đại đô thị Grand Park với nội thất bàn giao chuẩn Hafele, Kohler.'),
('proj-vh-smartcity', 'Vinhomes Smart City', 'vinhomes-smart-city', 'Tây Mỗ - Đại Mỗ, Nam Từ Liêm, Hà Nội', 'Vingroup', '58 Tòa chung cư (Sapphire, The Tonkin, The Sakura, The Miami, Lumiere Evergreen)', '', ARRAY['S1.01','S1.02','S2.01','S2.02','S3.01','S4.01','S4.02','The Tonkin TK1','The Tonkin TK2','The Sakura SA2','The Miami GS1'], ARRAY['studio','1pn','1pn_plus','2pn_1wc','2pn_2wc','3pn'], 'Thành phố quốc tế năng động phía Tây Hà Nội với hệ sinh thái thông minh 4 trụ cột: An ninh, Vận hành, Cộng đồng, Căn hộ thông minh.'),
('proj-the-beverly', 'The Beverly - Vinhomes Grand Park', 'the-beverly-grand-park', 'Phước Thiện, Long Bình, TP. Thủ Đức, TP.HCM', 'Vingroup & Mitsubishi', '10 Tòa căn hộ cao cấp phong cách Beverly Hills', '', ARRAY['The Star BE1','The Star BE2','The Star BE3','The Resort BE5','The Resort BE6','The Resort BE7'], ARRAY['studio','1pn_plus','2pn_2wc','3pn'], 'Phân khu nghỉ dưỡng phong cách Mỹ, trực diện đại công viên 36ha và công viên Grand Park đẹp nhất Sài Gòn.'),
('proj-ecopark-sky-oasis', 'Ecopark Sky Oasis & Haven Park', 'ecopark-sky-oasis', 'Văn Giang, Hưng Yên (Liền kề Hà Nội)', 'Tập đoàn Ecopark', '4 Tháp 41 tầng ven hồ vịnh đảo', '', ARRAY['Tháp S1','Tháp S2','Tháp S3','Tháp S-Premium','Haven Park H1','Haven Park H2'], ARRAY['studio','1pn','2pn_2wc','3pn','duplex'], 'Tòa tháp biểu tượng resort giữa mây trời, view trực diện vịnh đảo triệu đô Ecopark và hồ cảnh quan xanh mát.')
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

-- 3. APARTMENTS 6 rows đúng data gốc, strip hình/PDF/CAD/video
-- (roomDimensions, highlights, estimatedCostRange giữ nguyên vì là dữ liệu chữ)
INSERT INTO apartments (
  id, project_id, project_name, unit_code, axis_number,
  unit_type, unit_type_name, tower, floor_range,
  gross_area, net_area, ceiling_height, direction,
  floor_plan_image_url, floor_plan_pdf_url, cad_download_url, interior_catalogue_pdf_url,
  description, highlights,
  room_dimensions, interior_images, videos, estimated_cost_range
) VALUES
('apt-vh-ocp-2pn2wc-08','proj-vh-oceanpark','Vinhomes Ocean Park 1','S2.05-12A08','Trục 08','2pn_2wc','2 Phòng Ngủ + 2WC (Góc)','S2.05','Tầng 6 - 26 (Căn số 08)',69.2,63.8,2.85,'Cửa hướng Tây Nam, Ban công chính hướng Đông Bắc view Biển Hồ',NULL,NULL,NULL,NULL,'Căn hộ 2PN+2WC góc vuông vức 2 mặt thoáng, phòng khách kết nối logia đón gió mát quanh năm, tất cả các phòng ngủ đều có cửa sổ lớn ngập tràn ánh sáng tự nhiên.','{"Căn góc 2 mặt thoáng, 100% phòng ngủ có ánh sáng tự nhiên","Phòng khách rộng 19.8m² liên thông bếp tạo không gian mở thoáng đãng","Ban công dài 3.6m view trọn cụm công viên nội khu và hồ nước mặn","Bố trí công năng tối ưu, dễ dàng thi công nội thất tiết kiệm chi phí"}','[]','[]','[]','{"basic":"110.000.000đ - 145.000.000đ (Gỗ MDF chống ẩm phủ Melamine)","standard":"160.000.000đ - 210.000.000đ (Gỗ MDF lõi xanh An Cường + Sơn 2K)","premium":"250.000.000đ - 350.000.000đ (Cánh Kính Euro Gold + Đá Vicostone + Thiết bị cao cấp)"}'),
('apt-vh-ocp-1pnplus-12','proj-vh-oceanpark','Vinhomes Ocean Park 1','S1.08-1512','Trục 12','1pn_plus','1 Phòng Ngủ + 1 (Đa Năng)','S1.08','Tầng 5 - 28 (Căn số 12)',48.5,43.2,2.85,'Cửa hướng Đông Bắc, Ban công hướng Tây Nam đón ánh hoàng hôn',NULL,NULL,NULL,NULL,'Căn 1PN+1 huyền thoại tại Ocean Park với không gian +1 linh hoạt làm phòng làm việc, phòng ngủ phụ hoặc khu vực đọc sách, thiền trà.','{"Không gian +1 diện tích 5.8m² biến hóa thành phòng ngủ cho con hoặc phòng làm việc","Phòng khách và bếp liên hoàn cực kỳ rộng rãi","Chi phí hoàn thiện trọn gói chỉ từ 85 - 130 triệu","Dễ cho thuê giá cao hoặc ở gia đình trẻ 2-3 người"}','[]','[]','[]','{"basic":"85.000.000đ - 110.000.000đ","standard":"120.000.000đ - 155.000.000đ","premium":"175.000.000đ - 220.000.000đ"}'),
('apt-vh-ocp-2pn1wc-05a','proj-vh-oceanpark','Vinhomes Ocean Park 1','S1.02-0805A','Trục 05A','2pn_1wc','2 Phòng Ngủ - 1WC','S1.02','Tầng 4 - 26 (Căn số 05A)',60.5,55.4,2.85,'Cửa hướng Tây Bắc, Ban công Đông Nam mát mẻ',NULL,NULL,NULL,NULL,'Căn 2PN-1WC trục 05A thiết kế vuông vức, diện tích vừa phải, tối ưu chi phí hoàn thiện cho gia đình trẻ.','{"Ban công Đông Nam đón gió lành, không bị nắng gắt","Chi phí nội thất tiết kiệm, layout gọn gàng","2 phòng ngủ tách biệt, phòng khách mở"}','[]','[]','[]','{"basic":"95.000.000đ - 125.000.000đ","standard":"135.000.000đ - 175.000.000đ","premium":"190.000.000đ - 260.000.000đ"}'),
('apt-masteri-2pn-b06','proj-masteri-centre-point','Masteri Centre Point (Grand Park)','Tháp B-06','Trục 06','2pn_2wc','2 Phòng Ngủ + 2WC','Tháp B - Riviera','Tầng 3 - 32',74.5,68.2,3.0,'Cửa hướng Bắc, Ban công chính hướng Nam view hồ bơi phi thuyền & đại công viên',NULL,NULL,NULL,NULL,'Căn hộ tiêu chuẩn Masterise bàn giao hoàn thiện cơ bản chuẩn quốc tế với chiều cao trần 3.0m thoáng đãng, kính Low-E full từ sàn tới trần.','{"Chiều cao trần 3.0m cực kỳ thông thoáng","Kính Low-E cách âm, cách nhiệt chống tia UV 99%","Bàn giao sẵn điều hòa âm trần Daikin","Hệ thống nước nóng trung tâm và thiết bị vệ sinh Kohler"}','[]','[]','[]','{"basic":"180.000.000đ - 240.000.000đ","standard":"260.000.000đ - 360.000.000đ","premium":"420.000.000đ - 650.000.000đ"}'),
('apt-smartcity-3pn-tk02','proj-vh-smartcity','Vinhomes Smart City','TK1-2202','Trục 02','3pn','3 Phòng Ngủ + 2WC (Căn Góc VIP)','The Tonkin TK1','Tầng 12 - 35',95.8,89.4,2.9,'Cửa Tây Nam, Ban công Đông Nam mát mẻ view bể bơi phong cách nhiệt đới',NULL,NULL,NULL,NULL,'Căn hộ 3PN cao cấp phân khu The Tonkin chuẩn phong cách Indochine Đông Dương sang trọng, không gian sinh hoạt rộng rãi cho gia đình 3 thế hệ.','{"Căn góc 3 mặt thoáng ngắm trọn cảnh quan","3 phòng ngủ tách biệt tạo không gian riêng tư","Phòng khách đại sảnh diện tích lên tới 28m²","Phân khu cao cấp có hầm để xe riêng biệt"}','[]','[]','[]','{"basic":"210.000.000đ - 290.000.000đ","standard":"320.000.000đ - 450.000.000đ","premium":"520.000.000đ - 780.000.000đ"}'),
('apt-beverly-studio-05','proj-the-beverly','The Beverly - Vinhomes Grand Park','BE1-1805','Trục 05','studio','Căn Hộ Studio Nghỉ Dưỡng','The Star BE1','Tầng 4 - 30',35.6,32.1,2.85,'Cửa Đông Bắc, Ban công Tây Nam ngắm trọn hoàng hôn công viên 36ha',NULL,NULL,NULL,NULL,'Căn hộ Studio nhỏ xinh, tối ưu công năng cho người độc thân hoặc khai thác cho thuê du lịch / chuyên gia với nội thất thông minh.','{"Thiết kế không vách ngăn giúp tối ưu diện tích","Ban công kính thoáng nhìn ra công viên 36ha","Chi phí hoàn thiện thấp, lợi suất cho thuê vượt trội","Sẵn sàng vào ở hoặc làm Airbnb"}','[]','[]','[]','{"basic":"65.000.000đ - 85.000.000đ","standard":"95.000.000đ - 130.000.000đ","premium":"145.000.000đ - 190.000.000đ"}')
ON CONFLICT (id) DO UPDATE SET
  project_id = EXCLUDED.project_id,
  project_name = EXCLUDED.project_name,
  unit_code = EXCLUDED.unit_code,
  axis_number = EXCLUDED.axis_number,
  unit_type = EXCLUDED.unit_type,
  unit_type_name = EXCLUDED.unit_type_name,
  tower = EXCLUDED.tower,
  floor_range = EXCLUDED.floor_range,
  gross_area = EXCLUDED.gross_area,
  net_area = EXCLUDED.net_area,
  ceiling_height = EXCLUDED.ceiling_height,
  direction = EXCLUDED.direction,
  floor_plan_image_url = EXCLUDED.floor_plan_image_url,
  floor_plan_pdf_url = EXCLUDED.floor_plan_pdf_url,
  cad_download_url = EXCLUDED.cad_download_url,
  interior_catalogue_pdf_url = EXCLUDED.interior_catalogue_pdf_url,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  interior_images = EXCLUDED.interior_images,
  videos = EXCLUDED.videos,
  estimated_cost_range = EXCLUDED.estimated_cost_range;

-- 4. VERIFY (chỉ SELECT, không sửa user)
SELECT 'projects' AS tbl, count(*) FROM projects
UNION ALL SELECT 'apartments', count(*) FROM apartments
UNION ALL SELECT 'settings', count(*) FROM settings;
SELECT id, brand_name, hotline, hero_headline FROM settings WHERE id = 1;
SELECT is_admin();
