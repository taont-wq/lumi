/**
 * vietnameseSearch — tìm kiếm thông minh bằng tiếng Việt tự nhiên.
 *
 * Zero dependency, không gọi API ngoài, không đụng AI.
 * Ví dụ: "căn 2 ngủ dưới 70m2 view hồ hướng đông" →
 *   { unitTypes: ['2pn_1wc','2pn_2wc'], maxArea: 70,
 *     directionKeywords: ['dong'], keywords: ['ho'] }
 */

import { ApartmentUnit, ApartmentUnitType } from '../types';

export interface SmartFilters {
  unitTypes: ApartmentUnitType[];
  tower: string;
  minArea: number | null;
  maxArea: number | null;
  directionKeywords: string[];
  keywords: string[];
  raw: string;
}

export const EMPTY_SMART_FILTERS: SmartFilters = {
  unitTypes: [],
  tower: '',
  minArea: null,
  maxArea: null,
  directionKeywords: [],
  keywords: [],
  raw: '',
};

/** Bỏ dấu + lowercase để match "2 ngu" vẫn ra "2 ngủ". */
export function normalizeVi(input: string): string {
  return (input || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9.\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const BEDROOM_TO_TYPES: Record<number, ApartmentUnitType[]> = {
  0: ['studio'],
  1: ['1pn', '1pn_plus'],
  2: ['2pn_1wc', '2pn_2wc'],
  3: ['3pn'],
  4: ['duplex', 'penthouse'],
  5: ['duplex', 'penthouse'],
};

const DIRECTION_WORDS = ['dong', 'tay', 'nam', 'bac', 'dong-bac', 'dong-nam', 'tay-bac', 'tay-nam'];

const STOP_WORDS = new Set([
  'can', 'can-ho', 'căn', 'ho', 'tim', 'cho', 'toi', 'em', 'minh',
  'cai', 'chiec', 'loa', 'mau', 'xem', 'co', 'la', 'o', 'tai',
  'voi', 'va', 'chung', 'cu', 'du', 'an', 'chung-cu', 'a', 'an',
]);

/** Parse câu tiếng Việt thành bộ lọc có cấu trúc. */
export function parseSmartQuery(input: string): SmartFilters {
  const text = normalizeVi(input);
  const filters: SmartFilters = {
    unitTypes: [],
    tower: '',
    minArea: null,
    maxArea: null,
    directionKeywords: [],
    keywords: [],
    raw: (input || '').trim(),
  };
  if (!text) return filters;

  let rest = ` ${text} `;

  // 1. Số phòng ngủ: "2 ngủ", "2pn", "2 phong ngu", "studio", "duplex/penthouse"
  if (/\bstudio\b/.test(rest)) {
    filters.unitTypes.push('studio');
    rest = rest.replace(/\bstudio\b/g, ' ');
  }
  if (/\b(duplex|penthouse)\b/.test(rest)) {
    filters.unitTypes.push('duplex', 'penthouse');
    rest = rest.replace(/\b(duplex|penthouse)\b/g, ' ');
  }
  const bedroomMatch = rest.match(/\b(\d)\s*(pn|ngu|phong\s*ngu)\b/);
  if (bedroomMatch) {
    const n = parseInt(bedroomMatch[1], 10);
    const mapped = BEDROOM_TO_TYPES[n];
    if (mapped) {
      mapped.forEach((t) => {
        if (!filters.unitTypes.includes(t)) filters.unitTypes.push(t);
      });
    }
    rest = rest.replace(bedroomMatch[0], ' ');
  }

  // 2. Diện tích: "dưới 70m2", "tren 50m2", "60-80m2"
  const rangeMatch = rest.match(/\b(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*m2?\b/);
  if (rangeMatch) {
    filters.minArea = parseFloat(rangeMatch[1]);
    filters.maxArea = parseFloat(rangeMatch[2]);
    rest = rest.replace(rangeMatch[0], ' ');
  } else {
    const maxMatch = rest.match(/\b(duoi|duoi\s*muc|duoi\s*nguong|nho\s*hon|max|duoi)\s*(\d+(?:\.\d+)?)\s*m2?\b/) ||
      rest.match(/\b(duoi)\s*(\d+(?:\.\d+)?)\b/);
    if (maxMatch) {
      filters.maxArea = parseFloat(maxMatch[maxMatch.length - 1]);
      rest = rest.replace(maxMatch[0], ' ');
    }
    const minMatch = rest.match(/\b(tren|lon\s*hon|min|tu)\s*(\d+(?:\.\d+)?)\s*m2?\b/) ||
      rest.match(/\b(tren)\s*(\d+(?:\.\d+)?)\b/);
    if (minMatch) {
      filters.minArea = parseFloat(minMatch[minMatch.length - 1]);
      rest = rest.replace(minMatch[0], ' ');
    }
  }
  // "70m2" lẻ loi → hiểu là diện tích tối đa
  const lonelyArea = !rangeMatch && filters.maxArea === null && rest.match(/\b(\d+(?:\.\d+)?)\s*m2\b/);
  if (lonelyArea) {
    filters.maxArea = parseFloat(lonelyArea[1]);
    rest = rest.replace(lonelyArea[0], ' ');
  }

  // 3. Tòa: "tòa S2", "toa s1.08"
  const towerMatch = rest.match(/\btoa\s*([a-z0-9][a-z0-9.\-]*)/);
  if (towerMatch) {
    filters.tower = towerMatch[1];
    rest = rest.replace(towerMatch[0], ' ');
  }

  // 4. Hướng: "hướng đông", hoặc từ hướng lẻ loi
  const dirMatch = rest.match(/\bhuong\s+([a-z\s\-]+?)(?=\s{2,}|$)/);
  const dirSource = dirMatch ? ` ${dirMatch[1]} ` : rest;
  DIRECTION_WORDS.forEach((w) => {
    if (dirSource.includes(` ${w} `) || dirSource.includes(` ${w}-`) || dirSource.includes(`-${w} `)) {
      const short = w.split('-')[0];
      [w, short].forEach((v) => {
        if (!filters.directionKeywords.includes(v)) filters.directionKeywords.push(v);
      });
    }
  });
  if (dirMatch) rest = rest.replace(dirMatch[0], ' ');

  // 5. "view X" → keyword quét mô tả/highlights
  const viewMatch = rest.match(/\bview\s+([a-z\s]+?)(?=\s{2,}|$)/);
  if (viewMatch) {
    viewMatch[1].trim().split(/\s+/).forEach((w) => {
      if (w.length > 1 && !filters.keywords.includes(w)) filters.keywords.push(w);
    });
    rest = rest.replace(viewMatch[0], ' ');
  }

  // 6. Phần còn lại → keywords (bỏ stop words, bỏ số lẻ đã xử lý)
  rest
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w) && !/^\d+(\.\d+)?$/.test(w))
    .forEach((w) => {
      if (!filters.keywords.includes(w)) filters.keywords.push(w);
    });

  return filters;
}

/** Text ghép để match keyword (đã normalize). */
function searchableText(apt: ApartmentUnit): string {
  const parts = [
    apt.unitCode,
    apt.tower,
    apt.projectName,
    apt.unitTypeName,
    apt.axisNumber || '',
    apt.direction || '',
    apt.description || '',
    ...(apt.highlights || []),
  ];
  return normalizeVi(parts.join(' '));
}

/** Áp bộ lọc thông minh lên 1 căn. */
export function matchSmartFilters(apt: ApartmentUnit, f: SmartFilters): boolean {
  if (f.unitTypes.length > 0 && !f.unitTypes.includes(apt.unitType)) return false;

  if (f.tower) {
    const towerNorm = normalizeVi(apt.tower || '');
    if (!towerNorm.includes(f.tower)) return false;
  }

  const area = apt.netArea || apt.grossArea || 0;
  if (f.minArea !== null && area < f.minArea) return false;
  if (f.maxArea !== null && area > f.maxArea) return false;

  if (f.directionKeywords.length > 0) {
    const dirNorm = normalizeVi(apt.direction || '');
    const hit = f.directionKeywords.some((d) => dirNorm.includes(d));
    if (!hit) return false;
  }

  if (f.keywords.length > 0) {
    const haystack = searchableText(apt);
    const hit = f.keywords.some((k) => haystack.includes(k));
    if (!hit) return false;
  }

  return true;
}

/** Tóm tắt filter đã bắt được, để hiện chip cho user thấy. */
export function describeSmartFilters(f: SmartFilters): string[] {
  const chips: string[] = [];
  if (f.unitTypes.length > 0) chips.push(`Loại: ${f.unitTypes.join(', ')}`);
  if (f.tower) chips.push(`Tòa: ${f.tower.toUpperCase()}`);
  if (f.minArea !== null || f.maxArea !== null) {
    if (f.minArea !== null && f.maxArea !== null) chips.push(`DT: ${f.minArea}–${f.maxArea}m²`);
    else if (f.maxArea !== null) chips.push(`DT ≤ ${f.maxArea}m²`);
    else chips.push(`DT ≥ ${f.minArea}m²`);
  }
  if (f.directionKeywords.length > 0) chips.push(`Hướng: ${f.directionKeywords.join('/')}`);
  if (f.keywords.length > 0) chips.push(`Từ khóa: ${f.keywords.join(' ')}`);
  return chips;
}
