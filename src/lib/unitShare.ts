/**
 * unitShare — link chia sẻ + bài viết copy sẵn cho từng căn hộ.
 *
 * Không thư viện ngoài. Chỉ dùng API có sẵn của trình duyệt
 * (clipboard, navigator.share). Mọi thông tin doanh nghiệp
 * (tên brand, hotline, link) đều lấy từ settings thật, không hardcode.
 */

import { ApartmentUnit, AppSettings } from '../types';

export const SHARE_PARAM = 'unit';

/** Link mở thẳng đúng căn: https://domain/?unit=S2.05-12A08 */
export function buildUnitUrl(unitCode: string): string {
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : '';
  return `${origin}/?${SHARE_PARAM}=${encodeURIComponent(unitCode)}`;
}

/** Đọc ?unit= trên URL hiện tại (nếu có). */
export function getSharedUnitCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const code = new URLSearchParams(window.location.search).get(SHARE_PARAM);
    return code && code.trim() ? code.trim() : null;
  } catch {
    return null;
  }
}

/** Xóa ?unit= khỏi URL sau khi đã mở modal (giữ URL sạch). */
export function clearSharedUnitCode(): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete(SHARE_PARAM);
    window.history.replaceState({}, '', url.pathname + url.search + url.hash);
  } catch {
    /* bỏ qua */
  }
}

/** Rút gọn chuỗi giá "110.000.000đ - 145... (Gỗ...)" còn "...đ - ...đ". */
function shortCost(costText?: string): string {
  if (!costText) return '';
  const m = costText.match(/[\d.]+đ\s*-\s*[\d.]+đ/);
  return m ? m[0] : costText.split('(')[0].trim();
}

/**
 * Soạn bài viết đầy đủ thông tin doanh nghiệp để sale paste vào Zalo/FB.
 * brand + hotline + link đều lấy từ settings truyền vào.
 */
export function buildUnitPost(
  apt: ApartmentUnit,
  settings: AppSettings,
  unitUrl?: string
): string {
  const url = unitUrl || buildUnitUrl(apt.unitCode);
  const brand = settings.brandName || 'Lumi Design';
  const hotline = [settings.hotline, settings.hotline2].filter(Boolean).join(' - ');
  const cost = shortCost(apt.estimatedCostRange?.basic);

  const lines = [
    `🏢 ${brand} — ${apt.unitTypeName} ${apt.unitCode}`,
    `📍 ${apt.projectName}${apt.tower ? ` | Tòa ${apt.tower}` : ''}`,
    `📐 Thông thủy ${apt.netArea}m² (tim tường ${apt.grossArea}m²)${apt.direction ? ` | ${apt.direction}` : ''}`,
  ];
  if (cost) lines.push(`💰 Hoàn thiện từ ${cost}`);
  if (apt.highlights && apt.highlights.length > 0) {
    lines.push(`✨ ${apt.highlights[0]}`);
  }
  lines.push(`🔗 Xem mặt bằng + 3D: ${url}`);
  if (hotline) lines.push(`☎️ Hotline: ${hotline}`);
  if (settings.zaloNumber) lines.push(`💬 Zalo: ${settings.zaloNumber}`);
  if (settings.addressShowroom || settings.address) {
    lines.push(`🏠 ${settings.addressShowroom || settings.address}`);
  }
  return lines.join('\n');
}

/** Copy text, có fallback cho trình duyệt cũ / iframe không cho clipboard. */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext !== false) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* rơi xuống fallback */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Share hệ thống (mobile). Trả về false nếu trình duyệt không hỗ trợ. */
export async function nativeShare(title: string, text: string, url: string): Promise<boolean> {
  try {
    const nav = navigator as Navigator & {
      share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
      canShare?: (data: { title?: string; text?: string; url?: string }) => boolean;
    };
    if (!nav.share) return false;
    if (nav.canShare && !nav.canShare({ title, text, url })) {
      await nav.share({ title, text });
      return true;
    }
    await nav.share({ title, text, url });
    return true;
  } catch {
    return false;
  }
}
