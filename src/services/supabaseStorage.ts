/**
 * Supabase CRUD layer — thay thế localStorage storageService.
 *
 * Cung cấp các hàm CRUD giống storageService nhưng đọc/ghi Supabase:
 *   - getStoredProjects() / saveStoredProjects()
 *   - getStoredApartments() / saveStoredApartments()
 *   - getStoredLeads() / saveStoredLeads()
 *   - getStoredSettings() / saveStoredSettings()
 *
 * Migration strategy:
 *   - Tất cả hàm đều async (return Promise)
 *   - Nếu Supabase chưa cấu hình → fallback về localStorage cũ
 *   - Cache in-memory để giảm round-trip (10s TTL)
 */

import { ApartmentUnit, AppSettings, LeadRecord, Project } from '../types';
import { supabase, isSupabaseEnabled, ApartmentRow, LeadRow, ProjectRow, SettingsRow } from '../lib/supabase';
import { INITIAL_SETTINGS as SETTINGS_FALLBACK } from '../data/initialData';

// =================================================================
// IN-MEMORY CACHE (10 giây TTL) — tránh gọi DB liên tục
// =================================================================
const CACHE_TTL_MS = 10_000;
const cache = {
  projects: { data: null as Project[] | null, ts: 0 },
  apartments: { data: null as ApartmentUnit[] | null, ts: 0 },
  leads: { data: null as LeadRecord[] | null, ts: 0 },
  settings: { data: null as AppSettings | null, ts: 0 },
};

const isCacheValid = (entry: { data: any; ts: number }): boolean => {
  return entry.data !== null && Date.now() - entry.ts < CACHE_TTL_MS;
};

const invalidateCache = (key: keyof typeof cache): void => {
  cache[key].data = null;
  cache[key].ts = 0;
};

// =================================================================
// ROW → TS OBJECT MAPPERS
// =================================================================

function projectRowToObject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug || '',
    location: row.location || '',
    developer: row.developer || '',
    totalUnits: row.total_units || undefined,
    bannerUrl: row.banner_url || '',
    towers: row.towers || [],
    availableUnitTypes: (row.available_unit_types || []) as any[],
    description: row.description || undefined,
  };
}

function apartmentRowToObject(row: ApartmentRow): ApartmentUnit {
  return {
    id: row.id,
    projectId: row.project_id,
    projectName: row.project_name || '',
    unitCode: row.unit_code,
    axisNumber: row.axis_number || undefined,
    unitType: (row.unit_type as any) || '2pn_2wc',
    unitTypeName: row.unit_type_name || '',
    tower: row.tower || '',
    floorRange: row.floor_range || undefined,
    grossArea: row.gross_area || 0,
    netArea: row.net_area || 0,
    ceilingHeight: row.ceiling_height || 0,
    direction: row.direction || '',
    floorPlanImageUrl: row.floor_plan_image_url || '',
    floorPlanPdfUrl: row.floor_plan_pdf_url || undefined,
    cadDownloadUrl: row.cad_download_url || undefined,
    interiorCataloguePdfUrl: row.interior_catalogue_pdf_url || undefined,
    description: row.description || '',
    highlights: row.highlights || [],
    roomDimensions: row.room_dimensions || [],
    interiorImages: row.interior_images || [],
    videos: row.videos || [],
    estimatedCostRange: row.estimated_cost_range || undefined,
  };
}

function leadRowToObject(row: LeadRow): LeadRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    phoneNumber: row.phone_number,
    email: row.email || undefined,
    projectId: row.project_id || undefined,
    projectName: row.project_name || undefined,
    unitCode: row.unit_code || undefined,
    unitType: row.unit_type || undefined,
    action: (row.action as any) || 'book_consult',
    actionName: row.action_name || undefined,
    note: row.note || undefined,
    source: row.source || undefined,
    createdAt: row.created_at,
    status: row.status,
    syncedToGoogleSheet: row.synced_to_google_sheet,
  };
}

function settingsRowToObject(row: SettingsRow, fallback: AppSettings): AppSettings {
  return {
    brandName: row.brand_name || fallback.brandName,
    slogan: row.slogan || fallback.slogan,
    hotline: row.hotline || fallback.hotline,
    hotline2: row.hotline2 || undefined,
    zaloNumber: row.zalo_number || fallback.zaloNumber,
    zaloLink: row.zalo_link || fallback.zaloLink,
    address: row.address || fallback.address,
    addressShowroom: row.address_showroom || undefined,
    addressVpgd: row.address_vpgd || undefined,
    email: row.email || fallback.email,
    facebookUrl: row.facebook_url || undefined,
    googleSheetWebhookUrl: row.google_sheet_webhook_url || '',
    autoSyncGoogleSheet: row.auto_sync_google_sheet,
    adminPasswordHash: undefined, // KHÔNG lưu hash nữa — dùng Supabase Auth
    heroHeadline: row.hero_headline || fallback.heroHeadline,
    heroSubheadline: row.hero_subheadline || fallback.heroSubheadline,
  };
}

// =================================================================
// PROJECTS
// =================================================================

export async function getStoredProjects(): Promise<Project[]> {
  if (!isSupabaseEnabled() || !supabase) {
    // Fallback: localStorage
    const { getStoredProjects: localGet } = await import('./storageService');
    return localGet();
  }
  if (isCacheValid(cache.projects)) return cache.projects.data!;

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('[Supabase] getStoredProjects error:', error);
    return [];
  }
  const projects = (data || []).map(projectRowToObject);
  cache.projects = { data: projects, ts: Date.now() };
  return projects;
}

export async function saveStoredProjects(projects: Project[]): Promise<void> {
  if (!isSupabaseEnabled() || !supabase) {
    const { saveStoredProjects: localSave } = await import('./storageService');
    return localSave(projects);
  }
  // Upsert: insert hoặc update nếu đã tồn tại
  const rows = projects.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug || null,
    location: p.location || null,
    developer: p.developer || null,
    total_units: p.totalUnits || null,
    banner_url: p.bannerUrl || null,
    towers: p.towers || [],
    available_unit_types: p.availableUnitTypes || [],
    description: p.description || null,
  }));
  const { error } = await supabase.from('projects').upsert(rows);
  if (error) {
    console.error('[Supabase] saveStoredProjects error:', error);
    throw error;
  }
  invalidateCache('projects');
}

export async function deleteProject(projectId: string): Promise<void> {
  if (!isSupabaseEnabled() || !supabase) {
    const { saveStoredProjects } = await import('./storageService');
    const list = await getStoredProjects();
    return saveStoredProjects(list.filter((p) => p.id !== projectId));
  }
  const { error } = await supabase.from('projects').delete().eq('id', projectId);
  if (error) {
    console.error('[Supabase] deleteProject error:', error);
    throw error;
  }
  invalidateCache('projects');
}

// =================================================================
// APARTMENTS
// =================================================================

export async function getStoredApartments(): Promise<ApartmentUnit[]> {
  if (!isSupabaseEnabled() || !supabase) {
    const { getStoredApartments: localGet } = await import('./storageService');
    return localGet();
  }
  if (isCacheValid(cache.apartments)) return cache.apartments.data!;

  const { data, error } = await supabase
    .from('apartments')
    .select('*')
    .order('unit_code', { ascending: true });

  if (error) {
    console.error('[Supabase] getStoredApartments error:', error);
    return [];
  }
  const apartments = (data || []).map(apartmentRowToObject);
  cache.apartments = { data: apartments, ts: Date.now() };
  return apartments;
}

export async function saveStoredApartments(apartments: ApartmentUnit[]): Promise<void> {
  if (!isSupabaseEnabled() || !supabase) {
    const { saveStoredApartments: localSave } = await import('./storageService');
    return localSave(apartments);
  }
  const rows = apartments.map((a) => ({
    id: a.id,
    project_id: a.projectId,
    project_name: a.projectName,
    unit_code: a.unitCode,
    axis_number: a.axisNumber || null,
    unit_type: a.unitType,
    unit_type_name: a.unitTypeName,
    tower: a.tower,
    floor_range: a.floorRange || null,
    gross_area: a.grossArea,
    net_area: a.netArea,
    ceiling_height: a.ceilingHeight,
    direction: a.direction,
    floor_plan_image_url: a.floorPlanImageUrl || null,
    floor_plan_pdf_url: a.floorPlanPdfUrl || null,
    cad_download_url: a.cadDownloadUrl || null,
    interior_catalogue_pdf_url: a.interiorCataloguePdfUrl || null,
    description: a.description,
    highlights: a.highlights || [],
    room_dimensions: a.roomDimensions || [],
    interior_images: a.interiorImages || [],
    videos: a.videos || [],
    estimated_cost_range: a.estimatedCostRange || null,
  }));
  const { error } = await supabase.from('apartments').upsert(rows);
  if (error) {
    console.error('[Supabase] saveStoredApartments error:', error);
    throw error;
  }
  invalidateCache('apartments');
}

export async function deleteApartment(aptId: string): Promise<void> {
  if (!isSupabaseEnabled() || !supabase) {
    const { saveStoredApartments } = await import('./storageService');
    const list = await getStoredApartments();
    return saveStoredApartments(list.filter((a) => a.id !== aptId));
  }
  const { error } = await supabase.from('apartments').delete().eq('id', aptId);
  if (error) {
    console.error('[Supabase] deleteApartment error:', error);
    throw error;
  }
  invalidateCache('apartments');
}

// =================================================================
// LEADS (CRUD chính: insert + select + update status)
// =================================================================

export async function getStoredLeads(): Promise<LeadRecord[]> {
  if (!isSupabaseEnabled() || !supabase) {
    const { getStoredLeads: localGet } = await import('./storageService');
    return localGet();
  }
  if (isCacheValid(cache.leads)) return cache.leads.data!;

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase] getStoredLeads error:', error);
    return [];
  }
  const leads = (data || []).map(leadRowToObject);
  cache.leads = { data: leads, ts: Date.now() };
  return leads;
}

export async function saveStoredLeads(leads: LeadRecord[]): Promise<void> {
  if (!isSupabaseEnabled() || !supabase) {
    const { saveStoredLeads: localSave } = await import('./storageService');
    return localSave(leads);
  }
  const rows = leads.map((l) => ({
    id: l.id,
    full_name: l.fullName,
    phone_number: l.phoneNumber,
    email: l.email || null,
    project_id: l.projectId || null,
    project_name: l.projectName || null,
    unit_code: l.unitCode || null,
    unit_type: l.unitType || null,
    action: l.action as any, // LeadRecord.action là union string, cast để gán vào text column
    action_name: l.actionName || null,
    note: l.note || null,
    source: l.source || null,
    created_at: l.createdAt,
    status: l.status,
    synced_to_google_sheet: l.syncedToGoogleSheet || false,
  }));
  const { error } = await supabase.from('leads').upsert(rows);
  if (error) {
    console.error('[Supabase] saveStoredLeads error:', error);
    throw error;
  }
  invalidateCache('leads');
}

export async function addLead(lead: LeadRecord): Promise<void> {
  if (!isSupabaseEnabled() || !supabase) {
    const { saveStoredLeads: localSave } = await import('./storageService');
    const existing = await getStoredLeads();
    return localSave([lead, ...existing]);
  }
  const row = {
    id: lead.id,
    full_name: lead.fullName,
    phone_number: lead.phoneNumber,
    email: lead.email || null,
    project_id: lead.projectId || null,
    project_name: lead.projectName || null,
    unit_code: lead.unitCode || null,
    unit_type: lead.unitType || null,
    action: lead.action,
    action_name: lead.actionName || null,
    note: lead.note || null,
    source: lead.source || null,
    created_at: lead.createdAt,
    status: lead.status,
    synced_to_google_sheet: lead.syncedToGoogleSheet || false,
  };
  const { error } = await supabase.from('leads').insert(row);
  if (error) {
    console.error('[Supabase] addLead error:', error);
    throw error;
  }
  invalidateCache('leads');
}

// =================================================================
// SETTINGS (singleton — chỉ 1 row với id=1)
// =================================================================

export async function getStoredSettings(): Promise<AppSettings | null> {
  if (!isSupabaseEnabled() || !supabase) {
    const { getStoredSettings: localGet } = await import('./storageService');
    return localGet();
  }
  if (isCacheValid(cache.settings)) return cache.settings.data!;

  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    console.error('[Supabase] getStoredSettings error:', error);
    return null;
  }
  const mapped = settingsRowToObject(data as SettingsRow, SETTINGS_FALLBACK);
  mapped.zaloNumber = (mapped.zaloNumber || '').replace(/\s+/g, '');
  cache.settings = { data: mapped, ts: Date.now() };
  return mapped;
}

export async function saveStoredSettings(settings: AppSettings): Promise<void> {
  if (!isSupabaseEnabled() || !supabase) {
    const { saveStoredSettings: localSave } = await import('./storageService');
    return localSave(settings);
  }
  const row = {
    id: 1 as const,
    brand_name: settings.brandName,
    slogan: settings.slogan,
    hotline: settings.hotline,
    hotline2: settings.hotline2 || null,
    zalo_number: settings.zaloNumber,
    zalo_link: settings.zaloLink,
    address: settings.address,
    address_showroom: settings.addressShowroom || null,
    address_vpgd: settings.addressVpgd || [],
    email: settings.email,
    facebook_url: settings.facebookUrl || null,
    google_sheet_webhook_url: settings.googleSheetWebhookUrl,
    auto_sync_google_sheet: settings.autoSyncGoogleSheet,
    hero_headline: settings.heroHeadline,
    hero_subheadline: settings.heroSubheadline,
  };
  const { error } = await supabase.from('settings').upsert(row);
  if (error) {
    console.error('[Supabase] saveStoredSettings error:', error);
    throw error;
  }
  invalidateCache('settings');
}
