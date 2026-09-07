import type { ApartmentUnit } from '../types';

export function slugify(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function toSeoSlug(apt: Pick<ApartmentUnit, 'unitCode' | 'tower' | 'projectName' | 'unitTypeName'>): string {
  const parts = ['can-ho', apt.unitCode, apt.tower, apt.projectName, apt.unitTypeName]
    .map((p) => slugify(p || ''))
    .filter(Boolean);
  return parts.join('-');
}

export function buildApartmentSeoUrl(apt: Pick<ApartmentUnit, 'unitCode' | 'tower' | 'projectName' | 'unitTypeName'>): string {
  return `/can-ho/${toSeoSlug(apt)}`;
}

export function buildApartmentSeoAbsoluteUrl(
  apt: Pick<ApartmentUnit, 'unitCode' | 'tower' | 'projectName' | 'unitTypeName'>,
  origin?: string
): string {
  const base =
    origin ||
    (typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '');
  return `${base}${buildApartmentSeoUrl(apt)}`;
}

export function matchApartmentBySlug(apartments: ApartmentUnit[], slug: string): ApartmentUnit | undefined {
  const clean = (slug || '').toLowerCase().trim();
  if (!clean) return undefined;
  const bySlug = apartments.find((a) => toSeoSlug(a) === clean);
  if (bySlug) return bySlug;
  return apartments.find((a) => a.unitCode.toLowerCase() === clean);
}
