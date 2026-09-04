import { ApartmentUnit, AppSettings, Project } from '../types';

export const INITIAL_SETTINGS: AppSettings = {
  brandName: 'Lumi Design',
  slogan:
    'Tra cứu kích thước chi tiết căn hộ, sơ đồ mặt bằng & mẫu nội thất 3D - noithatlumi.vn',
  hotline: '058 929 4444',
  hotline2: '083 555 7878',
  zaloNumber: '0589294444',
  zaloLink: 'https://zalo.me/0589294444',
  address: 'Showroom: Shop chân đế Zurich 1, Vinhomes Ocean Park',
  addressShowroom: 'Shop chân đế Zurich 1, Vinhomes Ocean Park',
  addressVpgd: [
    'ZR1 0311, tòa ZR1, Vinhomes Ocean Park',
    'Tòa SA5, The Sakura, Vinhomes Smart City',
    'Tòa SF3, Skyforest, Ecopark, Hưng Yên',
  ],
  email: 'noithatlumidesign@gmail.com',
  facebookUrl: 'https://www.facebook.com/noithatlumidesign',
  googleSheetWebhookUrl: '',
  autoSyncGoogleSheet: true,
  adminPasswordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', // SHA-256 for 'admin123'
  heroHeadline: 'Tra Cứu Kích Thước Chi Tiết Căn Hộ & Mẫu Nội Thất 3D',
  heroSubheadline: 'Công cụ tra cứu kỹ thuật & nội thất 3D chính thức từ Lumi Design (noithatlumi.vn): Tải sơ đồ mặt bằng, đo đạc kích thước từng phòng, xem 500+ mẫu nội thất 3D và video bàn giao thực tế từng căn.',
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-vh-oceanpark',
    name: 'Vinhomes Ocean Park 1',
    slug: 'vinhomes-ocean-park-1',
    location: 'Đa Tốn, Gia Lâm, Hà Nội',
    developer: 'Vingroup',
    totalUnits: '66 Tòa chung cư (Sapphire, Ruby, Zen Park, Pavilion)',
    bannerUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80',
    towers: ['S1.01', 'S1.02', 'S1.03', 'S1.05', 'S1.06', 'S1.07', 'S1.08', 'S1.09', 'S1.10', 'S1.11', 'S1.12', 'S2.01', 'S2.02', 'S2.03', 'S2.05', 'S2.08', 'S2.10', 'S2.15', 'S2.18', 'Zen Park R1.01', 'Pavilion P1'],
    availableUnitTypes: ['studio', '1pn', '1pn_plus', '2pn_1wc', '2pn_2wc', '3pn'],
    description: 'Đại đô thị biển hồ quy mô 420ha với đầy đủ tiện ích chuẩn quốc tế, hồ nước mặn 6.1ha, hồ ngọc trai 24.5ha.'
  },
  {
    id: 'proj-masteri-centre-point',
    name: 'Masteri Centre Point (Grand Park)',
    slug: 'masteri-centre-point',
    location: 'Đường Nguyễn Xiển, Long Thạnh Mỹ, TP. Thủ Đức, TP.HCM',
    developer: 'Masterise Homes',
    totalUnits: '10 Tòa căn hộ compound cao cấp (5.094 căn)',
    bannerUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
    towers: ['Tháp A - Riviera', 'Tháp B - Riviera', 'Tháp C - Riviera', 'Tháp D - Riviera', 'Tháp E - Riviera', 'Tháp A - Lumière', 'Tháp B - Lumière'],
    availableUnitTypes: ['1pn', '1pn_plus', '2pn_2wc', '3pn', 'duplex'],
    description: 'Khu căn hộ compound biệt lập chuẩn quốc tế cao cấp nhất trung tâm đại đô thị Grand Park với nội thất bàn giao chuẩn Hafele, Kohler.'
  },
  {
    id: 'proj-vh-smartcity',
    name: 'Vinhomes Smart City',
    slug: 'vinhomes-smart-city',
    location: 'Tây Mỗ - Đại Mỗ, Nam Từ Liêm, Hà Nội',
    developer: 'Vingroup',
    totalUnits: '58 Tòa chung cư (Sapphire, The Tonkin, The Sakura, The Miami, Lumiere Evergreen)',
    bannerUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    towers: ['S1.01', 'S1.02', 'S2.01', 'S2.02', 'S3.01', 'S4.01', 'S4.02', 'The Tonkin TK1', 'The Tonkin TK2', 'The Sakura SA2', 'The Miami GS1'],
    availableUnitTypes: ['studio', '1pn', '1pn_plus', '2pn_1wc', '2pn_2wc', '3pn'],
    description: 'Thành phố quốc tế năng động phía Tây Hà Nội với hệ sinh thái thông minh 4 trụ cột: An ninh, Vận hành, Cộng đồng, Căn hộ thông minh.'
  },
  {
    id: 'proj-the-beverly',
    name: 'The Beverly - Vinhomes Grand Park',
    slug: 'the-beverly-grand-park',
    location: 'Phước Thiện, Long Bình, TP. Thủ Đức, TP.HCM',
    developer: 'Vingroup & Mitsubishi',
    totalUnits: '10 Tòa căn hộ cao cấp phong cách Beverly Hills',
    bannerUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
    towers: ['The Star BE1', 'The Star BE2', 'The Star BE3', 'The Resort BE5', 'The Resort BE6', 'The Resort BE7'],
    availableUnitTypes: ['studio', '1pn_plus', '2pn_2wc', '3pn'],
    description: 'Phân khu nghỉ dưỡng phong cách Mỹ, trực diện đại công viên 36ha và công viên Grand Park đẹp nhất Sài Gòn.'
  },
  {
    id: 'proj-ecopark-sky-oasis',
    name: 'Ecopark Sky Oasis & Haven Park',
    slug: 'ecopark-sky-oasis',
    location: 'Văn Giang, Hưng Yên (Liền kề Hà Nội)',
    developer: 'Tập đoàn Ecopark',
    totalUnits: '4 Tháp 41 tầng ven hồ vịnh đảo',
    bannerUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
    towers: ['Tháp S1', 'Tháp S2', 'Tháp S3', 'Tháp S-Premium', 'Haven Park H1', 'Haven Park H2'],
    availableUnitTypes: ['studio', '1pn', '2pn_2wc', '3pn', 'duplex'],
    description: 'Tòa tháp biểu tượng resort giữa mây trời, view trực diện vịnh đảo triệu đô Ecopark và hồ cảnh quan xanh mát.'
  }
];

export const INITIAL_APARTMENTS: ApartmentUnit[] = [
  {
    id: 'apt-vh-ocp-2pn2wc-08',
    projectId: 'proj-vh-oceanpark',
    projectName: 'Vinhomes Ocean Park 1',
    unitCode: 'S2.05-12A08',
    axisNumber: 'Trục 08',
    unitType: '2pn_2wc',
    unitTypeName: '2 Phòng Ngủ + 2WC (Góc)',
    tower: 'S2.05',
    floorRange: 'Tầng 6 - 26 (Căn số 08)',
    grossArea: 69.2,
    netArea: 63.8,
    ceilingHeight: 2.85,
    direction: 'Cửa hướng Tây Nam, Ban công chính hướng Đông Bắc view Biển Hồ',
    floorPlanImageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    floorPlanPdfUrl: 'https://example.com/mat-bang-S205-12A08.pdf',
    cadDownloadUrl: 'https://example.com/ban-ve-cad-S205-12A08.dwg',
    interiorCataloguePdfUrl: 'https://example.com/catalogue-vat-lieu-2pn.pdf',
    description: 'Căn hộ 2PN+2WC góc vuông vức 2 mặt thoáng, phòng khách kết nối logia đón gió mát quanh năm, tất cả các phòng ngủ đều có cửa sổ lớn ngập tràn ánh sáng tự nhiên.',
    highlights: [
      'Căn góc 2 mặt thoáng, 100% phòng ngủ có ánh sáng tự nhiên',
      'Phòng khách rộng 19.8m² liên thông bếp tạo không gian mở thoáng đãng',
      'Ban công dài 3.6m view trọn cụm công viên nội khu và hồ nước mặn',
      'Bố trí công năng tối ưu, dễ dàng thi công nội thất tiết kiệm chi phí'
    ],
    roomDimensions: [
      { id: 'r1', name: 'Phòng Khách + Phòng Ăn', width: 3.6, length: 5.5, area: 19.8, ceilingHeight: 2.85, note: 'Sàn gỗ công nghiệp, tường sơn trắng' },
      { id: 'r2', name: 'Khu Vực Bếp', width: 2.2, length: 3.1, area: 6.8, ceilingHeight: 2.7, note: 'Chờ sẵn ống thoát mùi, cấp thoát nước' },
      { id: 'r3', name: 'Phòng Ngủ Master (Chính)', width: 3.4, length: 4.2, area: 14.3, ceilingHeight: 2.85, note: 'Có WC khép kín, cửa sổ kính Low-E tràn viền' },
      { id: 'r4', name: 'Phòng Ngủ Nhỏ (Phụ)', width: 3.1, length: 3.6, area: 11.2, ceilingHeight: 2.85, note: 'Cửa sổ đón gió Đông Bắc' },
      { id: 'r5', name: 'WC Master', width: 1.6, length: 2.4, area: 3.8, ceilingHeight: 2.5, note: 'Vách kính tắm đứng, thiết bị vệ sinh cao cấp' },
      { id: 'r6', name: 'WC Chung', width: 1.5, length: 2.3, area: 3.5, ceilingHeight: 2.5, note: 'Gần khu vực sinh hoạt chung' },
      { id: 'r7', name: 'Ban Công Phòng Khách', width: 1.2, length: 3.6, area: 4.3, ceilingHeight: 2.85, note: 'Lan can kính cường lực an toàn' },
      { id: 'r8', name: 'Logia / Sân Phơi Phụ', width: 1.1, length: 2.1, area: 2.3, ceilingHeight: 2.85, note: 'Vị trí đặt máy giặt & cục nóng điều hòa' }
    ],
    interiorImages: [
      {
        id: 'img-1',
        title: 'Phòng Khách Hiện Đại Tone Gỗ Ấm & Trắng Sữa',
        style: 'modern',
        styleName: 'Hiện Đại (Modern)',
        url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
        roomType: 'living',
        roomTypeName: 'Phòng Khách',
        description: 'Bố trí sofa chữ I gọn gàng, vách ốp lam gỗ kết hợp đá cẩm thạch vân mây sang trọng.'
      },
      {
        id: 'img-2',
        title: 'Phòng Khách Phong Cách Japandi Tối Giản Bắc Âu',
        style: 'japandi',
        styleName: 'Japandi Tinh Tế',
        url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
        roomType: 'living',
        roomTypeName: 'Phòng Khách',
        description: 'Vật liệu gỗ sồi tự nhiên, mây tre đan và nệm nỉ cao cấp tạo cảm giác bình yên thư thái.'
      },
      {
        id: 'img-3',
        title: 'Bếp Chữ L Tối Ưu Diện Tích Có Đảo Bếp Bar',
        style: 'modern',
        styleName: 'Hiện Đại (Modern)',
        url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
        roomType: 'kitchen',
        roomTypeName: 'Phòng Bếp',
        description: 'Tủ bếp kịch trần An Cường chống ẩm phủ Melamine cao cấp, mặt đá Vicostone chống ố.'
      },
      {
        id: 'img-4',
        title: 'Phòng Ngủ Master Hiện Đại Với Tủ Áo Cánh Kính',
        style: 'modern',
        styleName: 'Hiện Đại (Modern)',
        url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
        roomType: 'bedroom',
        roomTypeName: 'Phòng Ngủ Master',
        description: 'Giường bọc nệm đầu giường êm ái, hệ tủ quần áo cánh kính đen tích hợp đèn LED cảm ứng.'
      },
      {
        id: 'img-5',
        title: 'Phòng Ngủ Nhỏ Phong Cách Japandi Tiết Kiệm Không Gian',
        style: 'japandi',
        styleName: 'Japandi Tinh Tế',
        url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
        roomType: 'bedroom',
        roomTypeName: 'Phòng Ngủ Phụ',
        description: 'Giường phản kết hợp ngăn kéo chứa đồ, bàn học gắn tường liền giá sách thông minh.'
      },
      {
        id: 'img-6',
        title: 'Phòng Khách Phong Cách Đông Dương Indochine Sang Trọng',
        style: 'indochine',
        styleName: 'Đông Dương (Indochine)',
        url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
        roomType: 'living',
        roomTypeName: 'Phòng Khách',
        description: 'Họa tiết gạch bông cổ điển, vòm cong gỗ tự nhiên và điểm nhấn hoa văn Á Đông độc bản.'
      },
      {
        id: 'img-7',
        title: 'Phòng Khách Phong Cách Luxury Đẳng Cấp',
        style: 'luxury',
        styleName: 'Luxury Cao Cấp',
        url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
        roomType: 'living',
        roomTypeName: 'Phòng Khách',
        description: 'Nẹp inox mạ PVD vàng gương, vách đá nhân tạo xuyên sáng và đèn chùm pha lê cao cấp.'
      }
    ],
    videos: [
      {
        id: 'vid-1',
        title: 'Video Quay Hiện Trạng Bàn Giao Thô & Kích Thước Thực Tế',
        type: 'handover',
        typeName: 'Hiện Trạng Bàn Giao',
        platform: 'youtube',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        embedUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80',
        duration: '04:25',
        author: 'KTS. Lê Nam - Real Estate Interior'
      },
      {
        id: 'vid-2',
        title: 'Review Căn 2PN Hoàn Thiện Thực Tế 100% Gỗ An Cường',
        type: 'interior_tour',
        typeName: 'Tour Nội Thất Thực Tế',
        platform: 'youtube',
        videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
        embedUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
        duration: '07:15',
        author: 'Review Nhà Đẹp'
      },
      {
        id: 'vid-3',
        title: 'Gợi Ý Bố Trí Phòng Khách 2PN Tối Ưu Chi Phí 120 Triệu (TikTok)',
        type: 'interior_tour',
        typeName: 'Kinh Nghiệm Hoàn Thiện',
        platform: 'tiktok',
        videoUrl: 'https://www.tiktok.com',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
        duration: '01:00',
        author: 'TikTok @noithatcanho'
      }
    ],
    estimatedCostRange: {
      basic: '110.000.000đ - 145.000.000đ (Gỗ MDF chống ẩm phủ Melamine)',
      standard: '160.000.000đ - 210.000.000đ (Gỗ MDF lõi xanh An Cường + Sơn 2K)',
      premium: '250.000.000đ - 350.000.000đ (Cánh Kính Euro Gold + Đá Vicostone + Thiết bị cao cấp)'
    }
  },
  {
    id: 'apt-vh-ocp-1pnplus-12',
    projectId: 'proj-vh-oceanpark',
    projectName: 'Vinhomes Ocean Park 1',
    unitCode: 'S1.08-1512',
    axisNumber: 'Trục 12',
    unitType: '1pn_plus',
    unitTypeName: '1 Phòng Ngủ + 1 (Đa Năng)',
    tower: 'S1.08',
    floorRange: 'Tầng 5 - 28 (Căn số 12)',
    grossArea: 48.5,
    netArea: 43.2,
    ceilingHeight: 2.85,
    direction: 'Cửa hướng Đông Bắc, Ban công hướng Tây Nam đón ánh hoàng hôn',
    floorPlanImageUrl: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1200&q=80',
    floorPlanPdfUrl: 'https://example.com/mat-bang-S108-1512.pdf',
    cadDownloadUrl: 'https://example.com/cad-S108-1512.dwg',
    interiorCataloguePdfUrl: 'https://example.com/catalogue-1pnplus.pdf',
    description: 'Căn 1PN+1 huyền thoại tại Ocean Park với không gian +1 linh hoạt làm phòng làm việc, phòng ngủ phụ hoặc khu vực đọc sách, thiền trà.',
    highlights: [
      'Không gian +1 diện tích 5.8m² biến hóa thành phòng ngủ cho con hoặc phòng làm việc',
      'Phòng khách và bếp liên hoàn cực kỳ rộng rãi',
      'Chi phí hoàn thiện trọn gói chỉ từ 85 - 130 triệu',
      'Dễ cho thuê giá cao hoặc ở gia đình trẻ 2-3 người'
    ],
    roomDimensions: [
      { id: 'r1', name: 'Phòng Khách + Ăn', width: 3.3, length: 4.8, area: 15.8, ceilingHeight: 2.85 },
      { id: 'r2', name: 'Bếp Nấu', width: 2.1, length: 2.6, area: 5.4, ceilingHeight: 2.7 },
      { id: 'r3', name: 'Phòng Ngủ Master', width: 3.2, length: 3.8, area: 12.1, ceilingHeight: 2.85 },
      { id: 'r4', name: 'Không Gian Đa Năng (+1)', width: 2.3, length: 2.5, area: 5.8, ceilingHeight: 2.85 },
      { id: 'r5', name: 'Phòng Tắm / WC', width: 1.6, length: 2.4, area: 3.8, ceilingHeight: 2.5 },
      { id: 'r6', name: 'Ban Công + Logia', width: 1.1, length: 3.2, area: 3.5, ceilingHeight: 2.85 }
    ],
    interiorImages: [
      {
        id: 'img-201',
        title: 'Mẫu Thiết Kế 1PN+1 Tối Giản Minimalist',
        style: 'minimalist',
        styleName: 'Tối Giản (Minimalism)',
        url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
        roomType: 'living',
        roomTypeName: 'Phòng Khách'
      },
      {
        id: 'img-202',
        title: 'Không Gian +1 Cải Tạo Thành Giường Tầng Thông Minh',
        style: 'modern',
        styleName: 'Hiện Đại (Modern)',
        url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        roomType: 'bedroom',
        roomTypeName: 'Khu Vực +1 Đa Năng'
      },
      {
        id: 'img-203',
        title: 'Phòng Ngủ Phong Cách Japandi Gỗ Tự Nhiên',
        style: 'japandi',
        styleName: 'Japandi Tinh Tế',
        url: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=80',
        roomType: 'bedroom',
        roomTypeName: 'Phòng Ngủ'
      }
    ],
    videos: [
      {
        id: 'vid-201',
        title: 'Biến Hóa Căn 1PN+1 Thành 2 Phòng Ngủ Đầy Đủ Tiện Nghi',
        type: 'interior_tour',
        typeName: 'Tour Nội Thất Thực Tế',
        platform: 'youtube',
        videoUrl: 'https://www.youtube.com',
        embedUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80',
        duration: '05:30',
        author: 'Nội Thất Căn Hộ Nhỏ'
      }
    ],
    estimatedCostRange: {
      basic: '85.000.000đ - 110.000.000đ',
      standard: '120.000.000đ - 155.000.000đ',
      premium: '175.000.000đ - 220.000.000đ'
    }
  },
  {
    id: 'apt-vh-ocp-2pn1wc-05a',
    projectId: 'proj-vh-oceanpark',
    projectName: 'Vinhomes Ocean Park 1',
    unitCode: 'S1.02-0805A',
    axisNumber: 'Trục 05A',
    unitType: '2pn_1wc',
    unitTypeName: '2 Phòng Ngủ - 1WC',
    tower: 'S1.02',
    floorRange: 'Tầng 4 - 26 (Căn số 05A)',
    grossArea: 60.5,
    netArea: 55.4,
    ceilingHeight: 2.85,
    direction: 'Cửa hướng Tây Bắc, Ban công Đông Nam mát mẻ',
    floorPlanImageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    description: 'Căn 2PN-1WC trục 05A thiết kế vuông vức, diện tích vừa phải, tối ưu chi phí hoàn thiện cho gia đình trẻ.',
    highlights: [
      'Ban công Đông Nam đón gió lành, không bị nắng gắt',
      'Chi phí nội thất tiết kiệm, layout gọn gàng',
      '2 phòng ngủ tách biệt, phòng khách mở'
    ],
    roomDimensions: [
      { id: 'r1', name: 'Phòng Khách + Ăn', width: 3.4, length: 5.0, area: 17.0, ceilingHeight: 2.85 },
      { id: 'r2', name: 'Bếp', width: 2.0, length: 2.8, area: 5.6, ceilingHeight: 2.7 },
      { id: 'r3', name: 'Phòng Ngủ 1', width: 3.2, length: 3.8, area: 12.1, ceilingHeight: 2.85 },
      { id: 'r4', name: 'Phòng Ngủ 2', width: 3.0, length: 3.4, area: 10.2, ceilingHeight: 2.85 },
      { id: 'r5', name: 'WC Chung', width: 1.6, length: 2.4, area: 3.8, ceilingHeight: 2.5 },
      { id: 'r6', name: 'Ban Công', width: 1.2, length: 3.0, area: 3.6, ceilingHeight: 2.85 }
    ],
    interiorImages: [
      {
        id: 'img-205a-1',
        title: 'Nội Thất 2PN Gỗ MDF Phong Cách Hiện Đại',
        style: 'modern',
        styleName: 'Hiện Đại (Modern)',
        url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
        roomType: 'living',
        roomTypeName: 'Phòng Khách'
      }
    ],
    videos: [],
    estimatedCostRange: {
      basic: '95.000.000đ - 125.000.000đ',
      standard: '135.000.000đ - 175.000.000đ',
      premium: '190.000.000đ - 260.000.000đ'
    }
  },
  {
    id: 'apt-masteri-2pn-b06',
    projectId: 'proj-masteri-centre-point',
    projectName: 'Masteri Centre Point (Grand Park)',
    unitCode: 'Tháp B-06',
    axisNumber: 'Trục 06',
    unitType: '2pn_2wc',
    unitTypeName: '2 Phòng Ngủ + 2WC',
    tower: 'Tháp B - Riviera',
    floorRange: 'Tầng 3 - 32',
    grossArea: 74.5,
    netArea: 68.2,
    ceilingHeight: 3.0,
    direction: 'Cửa hướng Bắc, Ban công chính hướng Nam view hồ bơi phi thuyền & đại công viên',
    floorPlanImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    floorPlanPdfUrl: 'https://example.com/mat-bang-masteri-b06.pdf',
    cadDownloadUrl: 'https://example.com/cad-masteri-b06.dwg',
    description: 'Căn hộ tiêu chuẩn Masterise bàn giao hoàn thiện cơ bản chuẩn quốc tế với chiều cao trần 3.0m thoáng đãng, kính Low-E full từ sàn tới trần.',
    highlights: [
      'Chiều cao trần 3.0m cực kỳ thông thoáng',
      'Kính Low-E cách âm, cách nhiệt chống tia UV 99%',
      'Bàn giao sẵn điều hòa âm trần Daikin',
      'Hệ thống nước nóng trung tâm và thiết bị vệ sinh Kohler'
    ],
    roomDimensions: [
      { id: 'r1', name: 'Phòng Khách + Bếp Ăn', width: 3.8, length: 6.2, area: 23.5, ceilingHeight: 3.0 },
      { id: 'r2', name: 'Phòng Ngủ Master', width: 3.6, length: 4.5, area: 16.2, ceilingHeight: 3.0 },
      { id: 'r3', name: 'Phòng Ngủ 2', width: 3.2, length: 3.8, area: 12.1, ceilingHeight: 3.0 },
      { id: 'r4', name: 'WC Master (Bồn tắm nằm & Đứng)', width: 1.8, length: 2.8, area: 5.0, ceilingHeight: 2.6 },
      { id: 'r5', name: 'WC Khách', width: 1.6, length: 2.4, area: 3.8, ceilingHeight: 2.6 },
      { id: 'r6', name: 'Ban Công Kính', width: 1.3, length: 3.8, area: 4.9, ceilingHeight: 3.0 },
      { id: 'r7', name: 'Logia Kỹ Thuật', width: 1.2, length: 2.2, area: 2.6, ceilingHeight: 3.0 }
    ],
    interiorImages: [
      {
        id: 'img-301',
        title: 'Nội Thất Luxury Phong Cách Ý Sang Trọng',
        style: 'luxury',
        styleName: 'Luxury Cao Cấp',
        url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
        roomType: 'living',
        roomTypeName: 'Phòng Khách'
      },
      {
        id: 'img-302',
        title: 'Phòng Ngủ Master Hiện Đại Nâng Tầm Đẳng Cấp',
        style: 'modern',
        styleName: 'Hiện Đại (Modern)',
        url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
        roomType: 'bedroom',
        roomTypeName: 'Phòng Ngủ Master'
      }
    ],
    videos: [
      {
        id: 'vid-301',
        title: 'Video Bàn Giao Căn 2PN Tháp B Masteri Centre Point',
        type: 'handover',
        typeName: 'Hiện Trạng Bàn Giao',
        platform: 'youtube',
        videoUrl: 'https://www.youtube.com',
        embedUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
        duration: '06:10',
        author: 'Masteri Channel'
      }
    ],
    estimatedCostRange: {
      basic: '180.000.000đ - 240.000.000đ',
      standard: '260.000.000đ - 360.000.000đ',
      premium: '420.000.000đ - 650.000.000đ'
    }
  },
  {
    id: 'apt-smartcity-3pn-tk02',
    projectId: 'proj-vh-smartcity',
    projectName: 'Vinhomes Smart City',
    unitCode: 'TK1-2202',
    axisNumber: 'Trục 02',
    unitType: '3pn',
    unitTypeName: '3 Phòng Ngủ + 2WC (Căn Góc VIP)',
    tower: 'The Tonkin TK1',
    floorRange: 'Tầng 12 - 35',
    grossArea: 95.8,
    netArea: 89.4,
    ceilingHeight: 2.9,
    direction: 'Cửa Tây Nam, Ban công Đông Nam mát mẻ view bể bơi phong cách nhiệt đới',
    floorPlanImageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    floorPlanPdfUrl: 'https://example.com/mat-bang-smartcity-tk1-2202.pdf',
    cadDownloadUrl: 'https://example.com/cad-smartcity-tk1-2202.dwg',
    description: 'Căn hộ 3PN cao cấp phân khu The Tonkin chuẩn phong cách Indochine Đông Dương sang trọng, không gian sinh hoạt rộng rãi cho gia đình 3 thế hệ.',
    highlights: [
      'Căn góc 3 mặt thoáng ngắm trọn cảnh quan',
      '3 phòng ngủ tách biệt tạo không gian riêng tư',
      'Phòng khách đại sảnh diện tích lên tới 28m²',
      'Phân khu cao cấp có hầm để xe riêng biệt'
    ],
    roomDimensions: [
      { id: 'r1', name: 'Phòng Khách + Phòng Ăn', width: 4.2, length: 6.8, area: 28.5, ceilingHeight: 2.9 },
      { id: 'r2', name: 'Bếp Riêng Biệt Kín Mùi', width: 2.4, length: 3.5, area: 8.4, ceilingHeight: 2.7 },
      { id: 'r3', name: 'Phòng Ngủ Master', width: 3.8, length: 4.6, area: 17.5, ceilingHeight: 2.9 },
      { id: 'r4', name: 'Phòng Ngủ 2', width: 3.3, length: 3.9, area: 12.8, ceilingHeight: 2.9 },
      { id: 'r5', name: 'Phòng Ngủ 3 (Trẻ Em)', width: 3.1, length: 3.6, area: 11.2, ceilingHeight: 2.9 },
      { id: 'r6', name: 'WC Master', width: 1.8, length: 2.6, area: 4.7, ceilingHeight: 2.5 },
      { id: 'r7', name: 'WC Chung', width: 1.6, length: 2.4, area: 3.8, ceilingHeight: 2.5 },
      { id: 'r8', name: 'Ban Công Chính', width: 1.4, length: 4.2, area: 5.8, ceilingHeight: 2.9 },
      { id: 'r9', name: 'Logia Giặt Phơi', width: 1.2, length: 2.4, area: 2.8, ceilingHeight: 2.9 }
    ],
    interiorImages: [
      {
        id: 'img-401',
        title: 'Phòng Khách 3PN Phong Cách Indochine Đậm Chất Á Đông',
        style: 'indochine',
        styleName: 'Đông Dương (Indochine)',
        url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
        roomType: 'living',
        roomTypeName: 'Phòng Khách'
      },
      {
        id: 'img-402',
        title: 'Phòng Ngủ Master Tân Cổ Điển Nhẹ Nhàng',
        style: 'neoclassic',
        styleName: 'Tân Cổ Điển (Neo Classic)',
        url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
        roomType: 'bedroom',
        roomTypeName: 'Phòng Ngủ Master'
      }
    ],
    videos: [
      {
        id: 'vid-401',
        title: 'Video Căn Hộ Mẫu 3PN The Tonkin Hoàn Thiện Phong Cách Indochine',
        type: 'interior_tour',
        typeName: 'Tour Nội Thất Thực Tế',
        platform: 'youtube',
        videoUrl: 'https://www.youtube.com',
        embedUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=600&q=80',
        duration: '08:45',
        author: 'Tonkin Homes'
      }
    ],
    estimatedCostRange: {
      basic: '210.000.000đ - 290.000.000đ',
      standard: '320.000.000đ - 450.000.000đ',
      premium: '520.000.000đ - 780.000.000đ'
    }
  },
  {
    id: 'apt-beverly-studio-05',
    projectId: 'proj-the-beverly',
    projectName: 'The Beverly - Vinhomes Grand Park',
    unitCode: 'BE1-1805',
    axisNumber: 'Trục 05',
    unitType: 'studio',
    unitTypeName: 'Căn Hộ Studio Nghỉ Dưỡng',
    tower: 'The Star BE1',
    floorRange: 'Tầng 4 - 30',
    grossArea: 35.6,
    netArea: 32.1,
    ceilingHeight: 2.85,
    direction: 'Cửa Đông Bắc, Ban công Tây Nam ngắm trọn hoàng hôn công viên 36ha',
    floorPlanImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    floorPlanPdfUrl: 'https://example.com/mat-bang-beverly-studio.pdf',
    cadDownloadUrl: 'https://example.com/cad-beverly-studio.dwg',
    description: 'Căn hộ Studio nhỏ xinh, tối ưu công năng cho người độc thân hoặc khai thác cho thuê du lịch / chuyên gia với nội thất thông minh.',
    highlights: [
      'Thiết kế không vách ngăn giúp tối ưu diện tích',
      'Ban công kính thoáng nhìn ra công viên 36ha',
      'Chi phí hoàn thiện thấp, lợi suất cho thuê vượt trội',
      'Sẵn sàng vào ở hoặc làm Airbnb'
    ],
    roomDimensions: [
      { id: 'r1', name: 'Không Gian Phòng Ngủ + Khách', width: 3.5, length: 5.2, area: 18.2, ceilingHeight: 2.85 },
      { id: 'r2', name: 'Khu Vực Bếp Nấu', width: 1.8, length: 2.6, area: 4.6, ceilingHeight: 2.7 },
      { id: 'r3', name: 'Phòng Tắm / WC', width: 1.6, length: 2.4, area: 3.8, ceilingHeight: 2.5 },
      { id: 'r4', name: 'Ban Công / Logia', width: 1.2, length: 2.9, area: 3.5, ceilingHeight: 2.85 }
    ],
    interiorImages: [
      {
        id: 'img-501',
        title: 'Nội Thất Studio Phong Cách Trẻ Trung Hiện Đại',
        style: 'modern',
        styleName: 'Hiện Đại (Modern)',
        url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
        roomType: 'living',
        roomTypeName: 'Không Gian Chung'
      }
    ],
    videos: [
      {
        id: 'vid-501',
        title: 'Review Studio The Beverly Full Nội Thất Chỉ Với 75 Triệu',
        type: 'interior_tour',
        typeName: 'Tour Thực Tế',
        platform: 'youtube',
        videoUrl: 'https://www.youtube.com',
        embedUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80',
        duration: '03:45',
        author: 'Decor Studio'
      }
    ],
    estimatedCostRange: {
      basic: '65.000.000đ - 85.000.000đ',
      standard: '95.000.000đ - 130.000.000đ',
      premium: '145.000.000đ - 190.000.000đ'
    }
  }
];

export const INITIAL_LEADS = [
  {
    id: 'lead-1',
    fullName: 'Anh Hoàng Nam',
    phoneNumber: '0912345678',
    email: 'hoangnam.hn@gmail.com',
    projectId: 'proj-vh-oceanpark',
    projectName: 'Vinhomes Ocean Park 1',
    unitCode: 'S2.05-12A08',
    unitType: '2 Phòng Ngủ + 2WC (Góc)',
    action: 'download_blueprint' as const,
    actionName: 'Tải sơ đồ mặt bằng kỹ thuật & CAD',
    note: 'Cần tư vấn thiết kế phong cách Japandi, dự kiến nhận nhà tháng sau.',
    createdAt: '2026-08-30 09:30:00',
    status: 'new' as const,
    syncedToGoogleSheet: true
  },
  {
    id: 'lead-2',
    fullName: 'Chị Mai Lan',
    phoneNumber: '0988765432',
    email: 'mailan.masteri@gmail.com',
    projectId: 'proj-masteri-centre-point',
    projectName: 'Masteri Centre Point (Grand Park)',
    unitCode: 'Tháp B-06',
    unitType: '2 Phòng Ngủ + 2WC',
    action: 'request_quotation' as const,
    actionName: 'Nhận báo giá dự toán thi công',
    note: 'Muốn làm gói cao cấp cánh kính An Cường.',
    createdAt: '2026-08-29 16:45:00',
    status: 'contacted' as const,
    syncedToGoogleSheet: true
  },
  {
    id: 'lead-3',
    fullName: 'Anh Đức Trí',
    phoneNumber: '0903112233',
    email: 'ductri.eco@yahoo.com',
    projectId: 'proj-vh-smartcity',
    projectName: 'Vinhomes Smart City',
    unitCode: 'TK1-2202',
    unitType: '3 Phòng Ngủ + 2WC (Căn Góc VIP)',
    action: 'download_catalogue' as const,
    actionName: 'Tải catalogue mẫu 3D Indochine',
    note: 'Đã nhận nhà đang tìm đơn vị thi công trọn gói.',
    createdAt: '2026-08-29 11:20:00',
    status: 'consulting' as const,
    syncedToGoogleSheet: false
  }
];
