export type InteriorDesignStyle =
  | 'modern'
  | 'japandi'
  | 'minimalist'
  | 'indochine'
  | 'neoclassic'
  | 'luxury';

export type ApartmentUnitType =
  | 'studio'
  | '1pn'
  | '1pn_plus'
  | '2pn_1wc'
  | '2pn_2wc'
  | '3pn'
  | 'duplex'
  | 'penthouse';

export interface RoomDimension {
  id: string;
  name: string;
  width: number; // in meters (m)
  length: number; // in meters (m)
  area: number; // in m2
  ceilingHeight?: number; // in m
  note?: string;
}

export interface InteriorImage {
  id: string;
  title: string;
  style: InteriorDesignStyle;
  styleName?: string;
  url: string;
  roomType: 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'balcony' | 'overall';
  roomTypeName?: string;
  description?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  type: 'handover' | 'interior_tour' | 'walkthrough_3d';
  typeName?: string;
  platform: 'youtube' | 'tiktok' | 'facebook' | 'direct';
  videoUrl: string;
  embedUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  author?: string;
}

export interface ApartmentUnit {
  id: string;
  projectId: string;
  projectName: string;
  unitCode: string; // e.g. "S2.05-12A08", "CH-08", "A-15.02"
  axisNumber: string; // Trục căn chung cư (e.g. "Trục 08", "Trục 05A", "Trục 02", "CH-06")
  unitType: ApartmentUnitType;
  unitTypeName: string; // e.g. "2 Phòng Ngủ + 2WC"
  tower: string; // e.g. "Tòa S2.05"
  floorRange?: string; // e.g. "Tầng 5 - 25"
  grossArea: number; // Diện tích tim tường (m2)
  netArea: number; // Diện tích thông thủy (m2)
  ceilingHeight: number; // Chiều cao trần (m)
  direction: string; // Hướng ban công & cửa chính
  floorPlanImageUrl: string; // Sơ đồ mặt bằng chi tiết 2D CAD
  floorPlanPdfUrl?: string; // Link tải PDF mặt bằng
  cadDownloadUrl?: string; // Link tải trọn bộ bản vẽ CAD
  interiorCataloguePdfUrl?: string; // Link catalogue vật liệu nội thất
  description?: string;
  highlights: string[];
  roomDimensions: RoomDimension[];
  interiorImages: InteriorImage[];
  videos: VideoItem[];
  estimatedCostRange?: {
    basic: string;
    standard: string;
    premium: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  location: string;
  developer: string;
  totalUnits?: string;
  bannerUrl: string;
  logoUrl?: string;
  description?: string;
  towers: string[];
  availableUnitTypes: ApartmentUnitType[];
}

export interface LeadRecord {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  projectId: string;
  projectName: string;
  unitCode?: string;
  unitType?: string;
  action: 'download_blueprint' | 'download_catalogue' | 'request_quotation' | 'book_consult';
  actionName?: string;
  note?: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'consulting' | 'completed';
  syncedToGoogleSheet?: boolean;
}

export interface AppSettings {
  brandName: string;
  slogan: string;
  hotline: string;
  zaloNumber: string;
  zaloLink: string;
  address: string;
  email: string;
  googleSheetWebhookUrl: string;
  autoSyncGoogleSheet: boolean;
  adminPasswordHash?: string;
  heroHeadline: string;
  heroSubheadline: string;
}

export interface SystemBackupData {
  version: string;
  exportedAt: string;
  projects: Project[];
  apartments: ApartmentUnit[];
  leads: LeadRecord[];
  settings: AppSettings;
}
