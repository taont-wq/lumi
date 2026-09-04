/**
 * Storage Service (Quick Win edition)
 *
 * - Quick Win #1: JSONBin.io as the central database
 * - Quick Win #2: Cloudinary for image hosting
 * - Quick Win #3: Google Form for lead capture
 *
 * Backwards-compatible surface: every legacy getStored* / saveStored* / submitLead
 * is kept with the same name and (now) returns a Promise. All callers in App.tsx and
 * AdminPortal.tsx have been updated to await. If VITE_USE_REMOTE_STORAGE is false,
 * the functions still work — they fall back to localStorage so the app keeps
 * running without any cloud setup.
 */

import { ApartmentUnit, AppSettings, LeadRecord, Project, SystemBackupData } from '../types';
import { INITIAL_APARTMENTS, INITIAL_LEADS, INITIAL_PROJECTS, INITIAL_SETTINGS } from '../data/initialData';
import { hashPassword } from './authService';
import { isCloudinaryConfigured, processImageFileToDataUrl as cloudinaryProcess } from './cloudinaryUpload';
import { submitLeadToGoogleForm } from './googleFormLead';
import { processImageFileToDataUrl as componentProcess } from '../components/ImageUploadInput';

// Legacy keys (kept so old localStorage data still loads on first run)
const LEGACY_KEYS = {
  PROJECTS: 'nhadep_projects_v1',
  APARTMENTS: 'nhadep_apartments_v1',
  LEADS: 'nhadep_leads_v1',
  SETTINGS: 'nhadep_settings_v1',
};

const USE_REMOTE = import.meta.env.VITE_USE_REMOTE_STORAGE === 'true';

// Lazy-load remoteStorage only if the feature flag is on. This way, projects that
// don't set VITE_USE_REMOTE_STORAGE at all still work in pure localStorage mode.
let remoteMod: typeof import('./remoteStorage') | null = null;
async function getRemote() {
  if (!USE_REMOTE) return null;
  if (!remoteMod) remoteMod = await import('./remoteStorage');
  return remoteMod;
}

// ============================================================
//  PROJECTS
// ============================================================

export async function getStoredProjects(): Promise<Project[]> {
  const remote = await getRemote();
  if (remote) {
    try { return await remote.getStoredProjects(); } catch (e) {
      console.warn('[storageService] getStoredProjects remote failed:', e);
    }
  }
  // localStorage fallback
  try {
    const raw = localStorage.getItem(LEGACY_KEYS.PROJECTS);
    if (!raw) {
      localStorage.setItem(LEGACY_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
      return INITIAL_PROJECTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading projects from localStorage:', err);
    return INITIAL_PROJECTS;
  }
}

export async function saveStoredProjects(projects: Project[]): Promise<void> {
  const remote = await getRemote();
  if (remote) {
    try { await remote.saveStoredProjects(projects); return; } catch (e) {
      console.warn('[storageService] saveStoredProjects remote failed:', e);
    }
  }
  try {
    localStorage.setItem(LEGACY_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (err) {
    console.error('Error saving projects to localStorage:', err);
  }
}

// ============================================================
//  APARTMENTS
// ============================================================

export async function getStoredApartments(): Promise<ApartmentUnit[]> {
  const remote = await getRemote();
  if (remote) {
    try {
      return await remote.getStoredApartments();
    } catch (e) {
      console.warn('[storageService] getStoredApartments remote failed:', e);
    }
  }
  try {
    const raw = localStorage.getItem(LEGACY_KEYS.APARTMENTS);
    if (!raw) {
      localStorage.setItem(LEGACY_KEYS.APARTMENTS, JSON.stringify(INITIAL_APARTMENTS));
      return INITIAL_APARTMENTS;
    }
    const list: ApartmentUnit[] = JSON.parse(raw);
    return list.map((apt) => {
      if (!apt.axisNumber) {
        const initMatch = INITIAL_APARTMENTS.find((ia) => ia.id === apt.id);
        if (initMatch?.axisNumber) return { ...apt, axisNumber: initMatch.axisNumber };
        const match = apt.unitCode?.match(/\d+([A-Za-z]?)$/);
        const axisNum = match ? match[0] : '01';
        return { ...apt, axisNumber: `Trục ${axisNum}` };
      }
      return apt;
    });
  } catch (err) {
    console.error('Error reading apartments from localStorage:', err);
    return INITIAL_APARTMENTS;
  }
}

export async function saveStoredApartments(apartments: ApartmentUnit[]): Promise<void> {
  const remote = await getRemote();
  if (remote) {
    try { await remote.saveStoredApartments(apartments); return; } catch (e) {
      console.warn('[storageService] saveStoredApartments remote failed:', e);
    }
  }
  try {
    localStorage.setItem(LEGACY_KEYS.APARTMENTS, JSON.stringify(apartments));
  } catch (err) {
    console.error('Error saving apartments to localStorage:', err);
  }
}

// ============================================================
//  LEADS
// ============================================================

export async function getStoredLeads(): Promise<LeadRecord[]> {
  const remote = await getRemote();
  if (remote) {
    try { return await remote.getStoredLeads(); } catch (e) {
      console.warn('[storageService] getStoredLeads remote failed:', e);
    }
  }
  try {
    const raw = localStorage.getItem(LEGACY_KEYS.LEADS);
    if (!raw) {
      localStorage.setItem(LEGACY_KEYS.LEADS, JSON.stringify(INITIAL_LEADS));
      return INITIAL_LEADS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading leads from localStorage:', err);
    return INITIAL_LEADS;
  }
}

export async function saveStoredLeads(leads: LeadRecord[]): Promise<void> {
  const remote = await getRemote();
  if (remote) {
    try { await remote.saveStoredLeads(leads); return; } catch (e) {
      console.warn('[storageService] saveStoredLeads remote failed:', e);
    }
  }
  try {
    localStorage.setItem(LEGACY_KEYS.LEADS, JSON.stringify(leads));
  } catch (err) {
    console.error('Error saving leads to localStorage:', err);
  }
}

// ============================================================
//  SETTINGS
// ============================================================

export async function getStoredSettings(): Promise<AppSettings> {
  const remote = await getRemote();
  if (remote) {
    try {
      const remoteSettings = await remote.getStoredSettings();
      const merged: AppSettings = { ...INITIAL_SETTINGS, ...remoteSettings };
      if (!merged.adminPasswordHash) merged.adminPasswordHash = INITIAL_SETTINGS.adminPasswordHash;
      return merged;
    } catch (e) {
      console.warn('[storageService] getStoredSettings remote failed:', e);
    }
  }
  try {
    const raw = localStorage.getItem(LEGACY_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(LEGACY_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    const merged: AppSettings = { ...INITIAL_SETTINGS, ...parsed };
    if (!merged.adminPasswordHash) merged.adminPasswordHash = INITIAL_SETTINGS.adminPasswordHash;
    return merged;
  } catch (err) {
    console.error('Error reading settings from localStorage:', err);
    return INITIAL_SETTINGS;
  }
}

export async function saveStoredSettings(settings: AppSettings): Promise<void> {
  const remote = await getRemote();
  if (remote) {
    try { await remote.saveStoredSettings(settings); return; } catch (e) {
      console.warn('[storageService] saveStoredSettings remote failed:', e);
    }
  }
  try {
    localStorage.setItem(LEGACY_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings to localStorage:', err);
  }
}

// ============================================================
//  LEGACY WEBHOOK (Apps Script URL, kept for backwards-compat)
// ============================================================

/**
 * Backwards-compatible wrapper. Original code in AdminPortal.tsx called this
 * with an Apps Script webhook URL. With Quick Win #3 (Google Form), lead
 * submission is handled by submitLead() → submitLeadToGoogleForm() instead.
 * This function is kept so the existing "Re-sync to Google Sheet" button
 * in the admin still works when an Apps Script URL is configured.
 */
export async function sendLeadToGoogleSheet(
  lead: LeadRecord,
  webhookUrl: string
): Promise<boolean> {
  if (!webhookUrl || !webhookUrl.trim().startsWith('http')) {
    return false;
  }
  try {
    const payload = {
      timestamp: lead.createdAt || new Date().toISOString(),
      fullName: lead.fullName || 'Khách hàng',
      phoneNumber: lead.phoneNumber,
      email: lead.email || '',
      projectName: lead.projectName,
      unitCode: lead.unitCode || 'Không rõ',
      unitType: lead.unitType || '',
      action: lead.actionName || lead.action,
      note: lead.note || '',
      source: 'Landing Page Tra Cứu Căn Hộ',
    };
    await fetch(webhookUrl.trim(), {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    return true;
  } catch (error) {
    console.warn('Could not forward lead to Google Sheet webhook:', error);
    return false;
  }
}

// ============================================================
//  LEAD SUBMISSION (Quick Win #3: Google Form)
// ============================================================

export async function submitLead(
  leadInput: Omit<LeadRecord, 'id' | 'createdAt' | 'status' | 'syncedToGoogleSheet'>
): Promise<{ success: boolean; lead: LeadRecord; synced: boolean }> {
  const result = await submitLeadToGoogleForm({
    fullName: leadInput.fullName,
    phoneNumber: leadInput.phoneNumber,
    email: leadInput.email,
    projectId: leadInput.projectId,
    projectName: leadInput.projectName,
    unitCode: leadInput.unitCode,
    unitType: leadInput.unitType,
    action: leadInput.action,
    actionName: leadInput.actionName,
    note: leadInput.note,
  });

  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const newLead: LeadRecord = {
    id: result.leadId,
    ...leadInput,
    createdAt: formattedDate,
    status: 'new',
    syncedToGoogleSheet: result.method === 'google_form',
  };

  // Save to local cache so admin sees it in the same session
  const currentLeads = await getStoredLeads();
  await saveStoredLeads([newLead, ...currentLeads]);

  return { success: result.success, lead: newLead, synced: newLead.syncedToGoogleSheet || false };
}

// ============================================================
//  IMAGE UPLOAD (Quick Win #2: Cloudinary)
// ============================================================

/**
 * Drop-in replacement that uses Cloudinary when configured, base64 otherwise.
 * Signature is identical to the old ImageUploadInput.processImageFileToDataUrl.
 */
export async function uploadImageForApp(file: File): Promise<string> {
  if (isCloudinaryConfigured()) {
    return cloudinaryProcess(file);
  }
  // Fallback to the in-component base64 helper when Cloudinary is not configured.
  return componentProcess(file);
}

// ============================================================
//  EXPORT / IMPORT / RESET (unchanged behaviour, local only)
// ============================================================

export function exportLeadsToCsv(leads?: LeadRecord[]): void {
  const doExport = (data: LeadRecord[]) => {
    if (data.length === 0) {
      alert('Chưa có dữ liệu khách hàng để xuất.');
      return;
    }
    const headers = [
      'Thời Gian', 'Họ Và Tên', 'Số Điện Thoại', 'Dự Án', 'Mã Căn',
      'Loại Căn', 'Hành Động / Yêu Cầu', 'Trạng Thái Xử Lý', 'Ghi Chú',
      'Đã Đồng Bộ Google Sheet',
    ];
    const rows = data.map((item) => [
      `"${item.createdAt}"`,
      `"${item.fullName.replace(/"/g, '""')}"`,
      `"${item.phoneNumber}"`,
      `"${(item.projectName || '').replace(/"/g, '""')}"`,
      `"${(item.unitCode || '').replace(/"/g, '""')}"`,
      `"${(item.unitType || '').replace(/"/g, '""')}"`,
      `"${(item.actionName || item.action || '').replace(/"/g, '""')}"`,
      `"${item.status === 'new' ? 'Mới' : item.status === 'contacted' ? 'Đã liên hệ' : item.status === 'consulting' ? 'Đang tư vấn' : 'Hoàn thành'}"`,
      `"${(item.note || '').replace(/"/g, '""')}"`,
      `"${item.syncedToGoogleSheet ? 'Đã đồng bộ' : 'Chưa'}"`,
    ]);
    downloadCsv(rows, headers, `Danh_Sach_Khach_Hang_Can_Ho_${todayStamp()}.csv`);
  };

  if (leads) {
    doExport(leads);
  } else {
    getStoredLeads().then(doExport);
  }
}

/**
 * Xuất danh sách căn hộ ra file CSV (mở bằng Excel/Google Sheets).
 */
export function exportApartmentsToCsv(apartments: ApartmentUnit[]): void {
  if (apartments.length === 0) {
    alert('Chưa có căn hộ nào để xuất.');
    return;
  }
  const headers = [
    'Mã Căn', 'Dự Án', 'Tòa', 'Trục', 'Tầng', 'Loại Căn', 'Tên Loại Căn',
    'DT Tim Tường (m²)', 'DT Thông Thủy (m²)', 'Chiều Cao Trần (m)',
    'Hướng', 'Mô Tả', 'Ưu Điểm', 'Số Phòng', 'Hình Mặt Bằng',
    'PDF Mặt Bằng', 'CAD Download', 'Catalogue Nội Thất',
    'Giá Cơ Bản', 'Giá Tiêu Chuẩn', 'Giá Cao Cấp',
  ];
  const rows = apartments.map((a) => [
    `"${(a.unitCode || '').replace(/"/g, '""')}"`,
    `"${(a.projectName || '').replace(/"/g, '""')}"`,
    `"${(a.tower || '').replace(/"/g, '""')}"`,
    `"${(a.axisNumber || '').replace(/"/g, '""')}"`,
    `"${(a.floorRange || '').replace(/"/g, '""')}"`,
    `"${(a.unitType || '').replace(/"/g, '""')}"`,
    `"${(a.unitTypeName || '').replace(/"/g, '""')}"`,
    String(a.grossArea ?? ''),
    String(a.netArea ?? ''),
    String(a.ceilingHeight ?? ''),
    `"${(a.direction || '').replace(/"/g, '""')}"`,
    `"${(a.description || '').replace(/"/g, '""')}"`,
    `"${(a.highlights || []).join(' | ').replace(/"/g, '""')}"`,
    String((a.roomDimensions || []).length),
    `"${(a.floorPlanImageUrl || '').replace(/"/g, '""')}"`,
    `"${(a.floorPlanPdfUrl || '').replace(/"/g, '""')}"`,
    `"${(a.cadDownloadUrl || '').replace(/"/g, '""')}"`,
    `"${(a.interiorCataloguePdfUrl || '').replace(/"/g, '""')}"`,
    `"${(a.estimatedCostRange?.basic || '').replace(/"/g, '""')}"`,
    `"${(a.estimatedCostRange?.standard || '').replace(/"/g, '""')}"`,
    `"${(a.estimatedCostRange?.premium || '').replace(/"/g, '""')}"`,
  ]);
  downloadCsv(rows, headers, `Danh_Sach_Can_Ho_${todayStamp()}.csv`);
}

/**
 * Xuất danh sách dự án ra file CSV.
 */
export function exportProjectsToCsv(projects: Project[]): void {
  if (projects.length === 0) {
    alert('Chưa có dự án nào để xuất.');
    return;
  }
  const headers = [
    'Tên Dự Án', 'Slug', 'Vị Trí', 'Chủ Đầu Tư', 'Tổng Số Căn',
    'Số Tòa Tháp', 'Danh Sách Tòa', 'Loại Căn Có Sẵn', 'Banner URL', 'Mô Tả',
  ];
  const rows = projects.map((p) => [
    `"${(p.name || '').replace(/"/g, '""')}"`,
    `"${(p.slug || '').replace(/"/g, '""')}"`,
    `"${(p.location || '').replace(/"/g, '""')}"`,
    `"${(p.developer || '').replace(/"/g, '""')}"`,
    `"${(p.totalUnits || '').replace(/"/g, '""')}"`,
    String((p.towers || []).length),
    `"${(p.towers || []).join(' | ').replace(/"/g, '""')}"`,
    `"${(p.availableUnitTypes || []).join(' | ').replace(/"/g, '""')}"`,
    `"${(p.bannerUrl || '').replace(/"/g, '""')}"`,
    `"${(p.description || '').replace(/"/g, '""')}"`,
  ]);
  downloadCsv(rows, headers, `Danh_Sach_Du_An_${todayStamp()}.csv`);
}

/**
 * Helper: tạo tên file có ngày YYYY-MM-DD.
 */
function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Helper: ghép rows + headers thành CSV có BOM UTF-8, tạo Blob và trigger download.
 */
function downloadCsv(rows: string[][], headers: string[], filename: string): void {
  const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function updateAdminPassword(newPasswordPlain: string): Promise<boolean> {
  try {
    const settings = await getStoredSettings();
    const newHash = await hashPassword(newPasswordPlain);
    settings.adminPasswordHash = newHash;
    await saveStoredSettings(settings);
    return true;
  } catch (err) {
    console.error('Error updating admin password:', err);
    return false;
  }
}

export function exportSystemBackup(): void {
  Promise.all([getStoredProjects(), getStoredApartments(), getStoredLeads(), getStoredSettings()]).then(
    ([projects, apartments, leads, settings]) => {
      const backup: SystemBackupData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        projects,
        apartments,
        leads,
        settings: (() => {
          // Remove password hash from backup to avoid leaking credentials
          const { adminPasswordHash, ...safe } = settings;
          return safe as AppSettings;
        })(),
      };
      const jsonStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      // Tên file có timestamp chi tiết: lumi-backup-20250903_1430.json
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
      link.setAttribute('href', url);
      link.setAttribute('download', `lumi-backup-${stamp}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  );
}

export async function importSystemBackup(jsonString: string): Promise<{ success: boolean; message: string }> {
  try {
    const data = JSON.parse(jsonString) as Partial<SystemBackupData>;
    if (!data.projects || !data.apartments) {
      return { success: false, message: 'File sao lưu không hợp lệ (thiếu danh sách dự án hoặc căn hộ).' };
    }
    if (Array.isArray(data.projects)) await saveStoredProjects(data.projects);
    if (Array.isArray(data.apartments)) await saveStoredApartments(data.apartments);
    if (Array.isArray(data.leads)) await saveStoredLeads(data.leads);
    if (data.settings && typeof data.settings === 'object') {
      const current = await getStoredSettings();
      await saveStoredSettings({ ...current, ...data.settings });
    }
    return {
      success: true,
      message: `Khôi phục thành công: ${data.projects.length} dự án, ${data.apartments.length} căn hộ, ${(data.leads || []).length} khách hàng.`,
    };
  } catch (err) {
    return { success: false, message: 'Lỗi đọc file JSON: ' + (err instanceof Error ? err.message : String(err)) };
  }
}

export async function resetAllData(): Promise<void> {
  await saveStoredProjects(INITIAL_PROJECTS);
  await saveStoredApartments(INITIAL_APARTMENTS);
  await saveStoredLeads(INITIAL_LEADS);
  await saveStoredSettings(INITIAL_SETTINGS);
}
