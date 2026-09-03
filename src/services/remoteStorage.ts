/**
 * Quick Win #1: Remote Storage Service dùng JSONBin.io
 * Thay thế localStorage bằng database tập trung miễn phí
 *
 * - Miễn phí 10.000 requests/tháng
 * - Auto sync giữa nhiều máy
 * - Có cache local để tăng tốc và fallback khi mất mạng
 *
 * Setup: xem .env.example
 */

import { ApartmentUnit, AppSettings, LeadRecord, Project } from '../types';
import { INITIAL_APARTMENTS, INITIAL_LEADS, INITIAL_PROJECTS, INITIAL_SETTINGS } from '../data/initialData';

// ============================================================
//  CẤU HÌNH
// ============================================================

const JSONBIN_BASE = 'https://api.jsonbin.io/v3/b';

// Cache key riêng cho remote để tránh đụng localStorage cũ
const CACHE_KEYS = {
  PROJECTS: 'lumi_remote_projects_cache',
  APARTMENTS: 'lumi_remote_apartments_cache',
  LEADS: 'lumi_remote_leads_cache',
  SETTINGS: 'lumi_remote_settings_cache',
};

const BIN_IDS = {
  PROJECTS: import.meta.env.VITE_JSONBIN_BIN_PROJECTS,
  APARTMENTS: import.meta.env.VITE_JSONBIN_BIN_APARTMENTS,
  LEADS: import.meta.env.VITE_JSONBIN_BIN_LEADS,
  SETTINGS: import.meta.env.VITE_JSONBIN_BIN_SETTINGS,
};

const MASTER_KEY = import.meta.env.VITE_JSONBIN_MASTER_KEY;
const USE_REMOTE = import.meta.env.VITE_USE_REMOTE_STORAGE === 'true';
const FALLBACK_LOCAL = import.meta.env.VITE_FALLBACK_TO_LOCAL !== 'false'; // default true

// ============================================================
//  FETCH HELPER
// ============================================================

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT';
  body?: unknown;
  retries?: number;
  timeoutMs?: number;
}

async function jsonbinFetch<T>(binId: string, opts: FetchOptions = {}): Promise<T> {
  if (!MASTER_KEY) {
    throw new Error('VITE_JSONBIN_MASTER_KEY chưa được cấu hình. Xem .env.example');
  }
  if (!binId) {
    throw new Error('JSONBin bin ID chưa được cấu hình');
  }

  const { method = 'GET', body, retries = 2, timeoutMs = 10000 } = opts;

  const url = `${JSONBIN_BASE}/${binId}${method === 'GET' ? '/latest' : ''}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': MASTER_KEY,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`JSONBin HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      // JSONBin v3 trả về { record: ..., metadata: ... }
      // Tùy method mà cấu trúc khác nhau
      return (data.record !== undefined ? data.record : data) as T;
    } catch (err) {
      clearTimeout(timeout);
      const isLast = attempt === retries;
      if (isLast) throw err;
      // Exponential backoff: 500ms, 1500ms
      await new Promise((r) => setTimeout(r, 500 * Math.pow(3, attempt)));
    }
  }

  throw new Error('Unreachable: retry loop exited');
}

// ============================================================
//  CACHE LAYER (giảm requests, hỗ trợ offline)
// ============================================================

function readCache<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeCache<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[remoteStorage] Cache write failed for ${key}:`, err);
  }
}

// ============================================================
//  GENERIC GETTER / SETTER
// ============================================================

async function getRemoteOrCached<T>(
  binId: string,
  cacheKey: string,
  initialValue: T
): Promise<T> {
  // 1) Trả cache ngay lập tức nếu có (cho UX mượt)
  const cached = readCache<T | null>(cacheKey, null);
  if (cached) {
    // Background refresh
    fetchLatestInBackground(binId, cacheKey, initialValue);
    return cached;
  }

  // 2) Nếu chưa có cache, đợi fetch
  return await fetchLatestInBackground(binId, cacheKey, initialValue);
}

async function fetchLatestInBackground<T>(
  binId: string,
  cacheKey: string,
  initialValue: T
): Promise<T> {
  try {
    const data = await jsonbinFetch<T>(binId);
    writeCache(cacheKey, data);
    return data;
  } catch (err) {
    console.warn(`[remoteStorage] Fetch failed for ${binId}, using fallback:`, err);
    if (FALLBACK_LOCAL) {
      const cached = readCache<T | null>(cacheKey, null);
      return cached ?? initialValue;
    }
    return initialValue;
  }
}

async function setRemote<T>(binId: string, cacheKey: string, value: T): Promise<void> {
  // Optimistic: cập nhật cache trước
  writeCache(cacheKey, value);

  if (!USE_REMOTE) return;

  // Sync lên remote
  try {
    await jsonbinFetch(binId, { method: 'PUT', body: value });
  } catch (err) {
    console.error(`[remoteStorage] Sync failed for ${binId}:`, err);
    if (!FALLBACK_LOCAL) throw err;
    // Cache đã lưu, sẽ thử lại lần sau
  }
}

// ============================================================
//  PUBLIC API - tương thích với storageService cũ
// ============================================================

// ----- Projects -----
export async function getStoredProjects(): Promise<Project[]> {
  if (!USE_REMOTE) {
    const raw = localStorage.getItem('nhadep_projects_v1');
    if (raw) return JSON.parse(raw);
    return INITIAL_PROJECTS;
  }
  return getRemoteOrCached<Project[]>(BIN_IDS.PROJECTS, CACHE_KEYS.PROJECTS, INITIAL_PROJECTS);
}

export async function saveStoredProjects(projects: Project[]): Promise<void> {
  if (!USE_REMOTE) {
    localStorage.setItem('nhadep_projects_v1', JSON.stringify(projects));
    return;
  }
  await setRemote(BIN_IDS.PROJECTS, CACHE_KEYS.PROJECTS, projects);
}

// ----- Apartments -----
export async function getStoredApartments(): Promise<ApartmentUnit[]> {
  if (!USE_REMOTE) {
    const raw = localStorage.getItem('nhadep_apartments_v1');
    if (raw) return JSON.parse(raw);
    return INITIAL_APARTMENTS;
  }
  return getRemoteOrCached<ApartmentUnit[]>(
    BIN_IDS.APARTMENTS,
    CACHE_KEYS.APARTMENTS,
    INITIAL_APARTMENTS
  );
}

export async function saveStoredApartments(apartments: ApartmentUnit[]): Promise<void> {
  if (!USE_REMOTE) {
    localStorage.setItem('nhadep_apartments_v1', JSON.stringify(apartments));
    return;
  }
  await setRemote(BIN_IDS.APARTMENTS, CACHE_KEYS.APARTMENTS, apartments);
}

// ----- Leads -----
export async function getStoredLeads(): Promise<LeadRecord[]> {
  if (!USE_REMOTE) {
    const raw = localStorage.getItem('nhadep_leads_v1');
    if (raw) return JSON.parse(raw);
    return INITIAL_LEADS;
  }
  return getRemoteOrCached<LeadRecord[]>(BIN_IDS.LEADS, CACHE_KEYS.LEADS, INITIAL_LEADS);
}

export async function saveStoredLeads(leads: LeadRecord[]): Promise<void> {
  if (!USE_REMOTE) {
    localStorage.setItem('nhadep_leads_v1', JSON.stringify(leads));
    return;
  }
  await setRemote(BIN_IDS.LEADS, CACHE_KEYS.LEADS, leads);
}

// ----- Settings -----
export async function getStoredSettings(): Promise<AppSettings> {
  if (!USE_REMOTE) {
    const raw = localStorage.getItem('nhadep_settings_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...INITIAL_SETTINGS, ...parsed };
    }
    return INITIAL_SETTINGS;
  }
  const remote = await getRemoteOrCached<AppSettings>(
    BIN_IDS.SETTINGS,
    CACHE_KEYS.SETTINGS,
    INITIAL_SETTINGS
  );
  return { ...INITIAL_SETTINGS, ...remote };
}

export async function saveStoredSettings(settings: AppSettings): Promise<void> {
  if (!USE_REMOTE) {
    localStorage.setItem('nhadep_settings_v1', JSON.stringify(settings));
    return;
  }
  await setRemote(BIN_IDS.SETTINGS, CACHE_KEYS.SETTINGS, settings);
}

// ============================================================
//  SYNC HELPER - ép tải lại từ server (dùng cho nút "Refresh")
// ============================================================

export async function forceRefreshAll(): Promise<{
  projects: Project[];
  apartments: ApartmentUnit[];
  leads: LeadRecord[];
  settings: AppSettings;
}> {
  if (!USE_REMOTE) {
    // Khi không dùng remote, đọc thẳng localStorage
    return {
      projects: JSON.parse(localStorage.getItem('nhadep_projects_v1') || 'null') || INITIAL_PROJECTS,
      apartments: JSON.parse(localStorage.getItem('nhadep_apartments_v1') || 'null') || INITIAL_APARTMENTS,
      leads: JSON.parse(localStorage.getItem('nhadep_leads_v1') || 'null') || INITIAL_LEADS,
      settings: JSON.parse(localStorage.getItem('nhadep_settings_v1') || 'null') || INITIAL_SETTINGS,
    };
  }

  const [projects, apartments, leads, settings] = await Promise.all([
    jsonbinFetch<Project[]>(BIN_IDS.PROJECTS).catch(() => INITIAL_PROJECTS),
    jsonbinFetch<ApartmentUnit[]>(BIN_IDS.APARTMENTS).catch(() => INITIAL_APARTMENTS),
    jsonbinFetch<LeadRecord[]>(BIN_IDS.LEADS).catch(() => INITIAL_LEADS),
    jsonbinFetch<AppSettings>(BIN_IDS.SETTINGS).catch(() => INITIAL_SETTINGS),
  ]);

  writeCache(CACHE_KEYS.PROJECTS, projects);
  writeCache(CACHE_KEYS.APARTMENTS, apartments);
  writeCache(CACHE_KEYS.LEADS, leads);
  writeCache(CACHE_KEYS.SETTINGS, settings);

  return { projects, apartments, leads, settings: { ...INITIAL_SETTINGS, ...settings } };
}

// ============================================================
//  HEALTH CHECK
// ============================================================

export async function checkRemoteHealth(): Promise<{
  ok: boolean;
  message: string;
  binsReachable: number;
}> {
  if (!USE_REMOTE) {
    return { ok: true, message: 'Đang dùng localStorage (VITE_USE_REMOTE_STORAGE=false)', binsReachable: 0 };
  }
  if (!MASTER_KEY) {
    return { ok: false, message: 'Thiếu VITE_JSONBIN_MASTER_KEY', binsReachable: 0 };
  }

  let reachable = 0;
  for (const [, binId] of Object.entries(BIN_IDS)) {
    if (!binId) continue;
    try {
      await jsonbinFetch(binId, { timeoutMs: 5000, retries: 0 });
      reachable++;
    } catch {
      // skip
    }
  }

  return {
    ok: reachable > 0,
    message: reachable === 4 ? 'Tất cả bins OK' : `Chỉ ${reachable}/4 bins khả dụng`,
    binsReachable: reachable,
  };
}
