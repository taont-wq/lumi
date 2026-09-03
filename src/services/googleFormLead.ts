/**
 * Quick Win #3: Google Form Lead Collector
 * Gửi lead từ landing page vào Google Form (miễn phí, tự động sync vào Google Sheet)
 *
 * Setup:
 *  1. Tạo Google Form với 9 trường (xem .env.example)
 *  2. Lấy form ID từ URL: docs.google.com/forms/d/e/FORM_ID/viewform
 *  3. Lấy entry ID cho từng field (xem hướng dẫn trong .env.example)
 *  4. Paste vào .env.local
 *
 * Ưu điểm:
 *  - Không cần backend
 *  - Tự động sync vào Google Sheet (admin xem ngay)
 *  - Có thể bật notification email khi có submit mới
 *  - Validation mặc định của Google Form
 *  - Anti-spam bằng reCAPTCHA (nếu bật trong Form settings)
 */

import { LeadRecord } from '../types';

const FORM_ID = import.meta.env.VITE_GOOGLE_FORM_ID;
const USE_GOOGLE_FORM = import.meta.env.VITE_USE_GOOGLE_FORM_LEAD === 'true';

// Field IDs - từng entry.<ID> trong form
const FIELDS = {
  phone: import.meta.env.VITE_GOOGLE_FORM_FIELD_PHONE || 'entry.0',
  name: import.meta.env.VITE_GOOGLE_FORM_FIELD_NAME || 'entry.1',
  email: import.meta.env.VITE_GOOGLE_FORM_FIELD_EMAIL || 'entry.2',
  project: import.meta.env.VITE_GOOGLE_FORM_FIELD_PROJECT || 'entry.3',
  unitCode: import.meta.env.VITE_GOOGLE_FORM_FIELD_UNITCODE || 'entry.4',
  unitType: import.meta.env.VITE_GOOGLE_FORM_FIELD_UNITTYPE || 'entry.5',
  action: import.meta.env.VITE_GOOGLE_FORM_FIELD_ACTION || 'entry.6',
  note: import.meta.env.VITE_GOOGLE_FORM_FIELD_NOTE || 'entry.7',
  timestamp: import.meta.env.VITE_GOOGLE_FORM_FIELD_TIMESTAMP || 'entry.8',
};

const SUBMIT_URL = FORM_ID ? `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse` : '';

// ============================================================
//  CONFIG CHECK
// ============================================================

export function isGoogleFormConfigured(): boolean {
  return USE_GOOGLE_FORM && Boolean(FORM_ID) && FORM_ID !== 'your_google_form_id_here';
}

// ============================================================
//  SUBMIT LEAD
// ============================================================

export interface SubmitLeadInput {
  fullName?: string;
  phoneNumber: string;
  email?: string;
  projectId?: string;
  projectName?: string;
  unitCode?: string;
  unitType?: string;
  action?: string;
  actionName?: string;
  note?: string;
}

export interface SubmitLeadResult {
  success: boolean;
  method: 'google_form' | 'local_fallback' | 'skipped';
  message: string;
  leadId: string;
}

/**
 * Gửi lead tới Google Form.
 * Google Form dùng mode 'no-cors' để bypass CORS - chấp nhận opaque response.
 * Nếu thất bại hoặc chưa cấu hình, fallback về localStorage (nếu có).
 */
export async function submitLeadToGoogleForm(
  input: SubmitLeadInput
): Promise<SubmitLeadResult> {
  const leadId = 'lead-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
  const now = new Date().toISOString();

  // Validate cơ bản
  if (!input.phoneNumber || input.phoneNumber.replace(/\D/g, '').length < 9) {
    return {
      success: false,
      method: 'skipped',
      message: 'Số điện thoại không hợp lệ',
      leadId,
    };
  }

  if (!isGoogleFormConfigured()) {
    console.warn('[googleFormLead] Chưa cấu hình Google Form. Dùng localStorage fallback.');
    return saveLeadToLocalFallback(input, leadId, now);
  }

  // Build form data (theo đúng entry IDs đã cấu hình)
  const formData = new FormData();
  formData.append(FIELDS.phone, input.phoneNumber);
  if (input.fullName) formData.append(FIELDS.name, input.fullName);
  if (input.email) formData.append(FIELDS.email, input.email);
  if (input.projectName) formData.append(FIELDS.project, input.projectName);
  if (input.unitCode) formData.append(FIELDS.unitCode, input.unitCode);
  if (input.unitType) formData.append(FIELDS.unitType, input.unitType);
  if (input.actionName || input.action) {
    formData.append(FIELDS.action, input.actionName || input.action || '');
  }
  if (input.note) formData.append(FIELDS.note, input.note);
  formData.append(FIELDS.timestamp, now);

  try {
    // no-cors: response là opaque, không đọc được status, nhưng request vẫn được gửi
    await fetch(SUBMIT_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: formData,
    });

    // Vì no-cors nên ta giả định thành công (Google thường rất ổn định)
    return {
      success: true,
      method: 'google_form',
      message: 'Đã gửi lead đến Google Form thành công',
      leadId,
    };
  } catch (err) {
    console.error('[googleFormLead] Submit failed:', err);
    return saveLeadToLocalFallback(input, leadId, now, err);
  }
}

// ============================================================
//  FALLBACK - lưu vào localStorage để Admin thấy trong cùng trình duyệt
// ============================================================

function saveLeadToLocalFallback(
  input: SubmitLeadInput,
  leadId: string,
  timestamp: string,
  networkErr?: unknown
): SubmitLeadResult {
  try {
    const KEY = 'lumi_fallback_leads';
    const raw = localStorage.getItem(KEY);
    const list: LeadRecord[] = raw ? JSON.parse(raw) : [];

    const lead: LeadRecord = {
      id: leadId,
      fullName: input.fullName || 'Khách hàng',
      phoneNumber: input.phoneNumber,
      email: input.email,
      projectId: input.projectId || 'unknown',
      projectName: input.projectName || 'Chung cư',
      unitCode: input.unitCode,
      unitType: input.unitType,
      action: (input.action as LeadRecord['action']) || 'book_consult',
      actionName: input.actionName,
      note: input.note,
      createdAt: timestamp,
      status: 'new',
      syncedToGoogleSheet: false,
    };

    list.unshift(lead);
    // Giữ tối đa 200 lead fallback
    if (list.length > 200) list.length = 200;
    localStorage.setItem(KEY, JSON.stringify(list));

    return {
      success: true,
      method: 'local_fallback',
      message: networkErr
        ? 'Mạng lỗi, đã lưu lead vào bộ nhớ tạm. Admin sẽ thấy khi mở cùng trình duyệt.'
        : 'Google Form chưa cấu hình, đã lưu vào bộ nhớ tạm.',
      leadId,
    };
  } catch (err) {
    return {
      success: false,
      method: 'skipped',
      message: 'Không thể lưu lead: ' + (err instanceof Error ? err.message : String(err)),
      leadId,
    };
  }
}

// ============================================================
//  HELPER: Lấy tất cả fallback leads (dùng cho Admin xem local)
// ============================================================

export function getFallbackLeads(): LeadRecord[] {
  try {
    const raw = localStorage.getItem('lumi_fallback_leads');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearFallbackLeads(): void {
  localStorage.removeItem('lumi_fallback_leads');
}

// ============================================================
//  HEALTH CHECK
// ============================================================

export async function checkGoogleFormHealth(): Promise<{
  ok: boolean;
  message: string;
}> {
  if (!USE_GOOGLE_FORM) {
    return { ok: true, message: 'Đang dùng localStorage (VITE_USE_GOOGLE_FORM_LEAD=false)' };
  }
  if (!FORM_ID || FORM_ID === 'your_google_form_id_here') {
    return { ok: false, message: 'Chưa cấu hình VITE_GOOGLE_FORM_ID' };
  }

  // Test với HEAD request - Google Form thường trả 200/302
  try {
    const res = await fetch(SUBMIT_URL, {
      method: 'HEAD',
      redirect: 'follow',
    });
    if (res.ok || res.status === 405) {
      // 405 = Method Not Allowed nhưng URL tồn tại - vẫn OK
      return { ok: true, message: 'Google Form URL khả dụng' };
    }
    return { ok: false, message: `HTTP ${res.status}` };
  } catch {
    return { ok: false, message: 'Không truy cập được Google Form' };
  }
}
