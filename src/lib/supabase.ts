/**
 * Supabase client + typed schema definitions.
 *
 * Cấu hình qua env vars (file .env):
 *   VITE_SUPABASE_URL       = https://xxxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY  = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 * LƯU Ý AN TOÀN:
 *   - ANON_KEY là public (an toàn khi lộ vì RLS bảo vệ)
 *   - KHÔNG BAO GIỜ commit SERVICE_ROLE_KEY vào repo
 *   - File này chỉ dùng để tạo client; logic auth/RLS đặt ở auth.ts
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Supabase client singleton. Có thể là null nếu chưa cấu hình env vars
 * (cho phép app chạy ở chế độ "fallback" không có DB).
 */
export const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          // Lưu session trong localStorage (mặc định), có thể đổi sang cookie
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        realtime: {
          // Tắt realtime mặc định để tiết kiệm connection (bật khi cần)
          params: { eventsPerSecond: 2 },
        },
      })
    : null;

export const isSupabaseEnabled = (): boolean => supabase !== null;

/**
 * Database schema (mirror cấu trúc SQL trong Supabase Dashboard).
 * Dùng để type-safety khi gọi .from('table').select()/insert()/update().
 */
export interface Database {
  public: {
    Tables: {
      projects: {
        Row: ProjectRow;
        Insert: Partial<ProjectRow> & { id: string };
        Update: Partial<ProjectRow>;
      };
      apartments: {
        Row: ApartmentRow;
        Insert: Partial<ApartmentRow> & { id: string };
        Update: Partial<ApartmentRow>;
      };
      leads: {
        Row: LeadRow;
        Insert: Partial<LeadRow> & { id: string };
        Update: Partial<LeadRow>;
      };
      settings: {
        Row: SettingsRow;
        Insert: Partial<SettingsRow>;
        Update: Partial<SettingsRow>;
      };
      audit_log: {
        Row: AuditLogRow;
        Insert: Partial<AuditLogRow>;
        Update: never;
      };
    };
  };
}

// === Row types — mirror cấu trúc SQL ===

export interface ProjectRow {
  id: string;
  name: string;
  slug: string | null;
  location: string | null;
  developer: string | null;
  total_units: string | null;
  banner_url: string | null;
  towers: string[];
  available_unit_types: string[];
  description: string | null;
  created_at: string;
}

export interface ApartmentRow {
  id: string;
  project_id: string;
  project_name: string | null;
  unit_code: string;
  axis_number: string | null;
  unit_type: string | null;
  unit_type_name: string | null;
  tower: string | null;
  floor_range: string | null;
  gross_area: number | null;
  net_area: number | null;
  ceiling_height: number | null;
  direction: string | null;
  floor_plan_image_url: string | null;
  floor_plan_pdf_url: string | null;
  cad_download_url: string | null;
  interior_catalogue_pdf_url: string | null;
  description: string | null;
  highlights: string[];
  // room_dimensions, interior_images, videos, estimated_cost_range:
  // lưu JSONB, không thể type chính xác ở DB layer, sẽ cast sang TS types khi dùng
  room_dimensions: any;
  interior_images: any;
  videos: any;
  estimated_cost_range: any;
  created_at: string;
}

export interface LeadRow {
  id: string;
  full_name: string;
  phone_number: string;
  email: string | null;
  project_id: string | null;
  project_name: string | null;
  unit_code: string | null;
  unit_type: string | null;
  action: string | null;
  action_name: string | null;
  note: string | null;
  source: string | null;
  created_at: string;
  status: 'new' | 'contacted' | 'consulting' | 'completed';
  synced_to_google_sheet: boolean;
}

export interface SettingsRow {
  id: 1; // singleton constraint
  brand_name: string | null;
  slogan: string | null;
  hotline: string | null;
  hotline2: string | null;
  zalo_number: string | null;
  zalo_link: string | null;
  address: string | null;
  address_showroom: string | null;
  address_vpgd: string[];
  email: string | null;
  facebook_url: string | null;
  google_sheet_webhook_url: string | null;
  auto_sync_google_sheet: boolean;
  hero_headline: string | null;
  hero_subheadline: string | null;
}

export interface AuditLogRow {
  id: number;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: any;
  created_at: string;
}
