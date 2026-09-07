/**
 * generate-sitemap.js — tự sinh public/sitemap.xml từ data Supabase thật.
 *
 * Chạy tự động trước mỗi build (xem package.json > scripts.build),
 * nên sitemap trên Vercel luôn khớp DB mới nhất mà không cần động tay.
 * Zero dependency mới: chỉ dùng @supabase/supabase-js đã có + fs của Node.
 * Nếu Supabase lỗi: giữ file sitemap cũ, KHÔNG fail build.
 *
 * Env: SUPABASE_URL / VITE_SUPABASE_URL, SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY,
 *       SITE_URL (vd https://tra-cuu.noithatlumi.vn)
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'sitemap.xml');

const SITE_URL = (process.env.SITE_URL || 'https://lumi-tau-virid.vercel.app').replace(/\/+$/, '');
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const ANON_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Giữ đồng bộ với src/lib/apartmentSlug.ts (script Node không import được TS).
const DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g');

function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function toSeoSlug(apt) {
  const parts = ['can-ho', apt.unit_code, apt.tower, apt.project_name, apt.unit_type_name]
    .map((p) => slugify(p || ''))
    .filter(Boolean);
  return parts.join('-');
}

async function main() {
  let apartments = [];
  if (SUPABASE_URL && ANON_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await supabase
        .from('apartments')
        .select('unit_code,tower,project_name,unit_type_name');
      if (error) throw new Error(error.message);
      apartments = data || [];
    } catch (e) {
      console.warn('[sitemap] Supabase read failed, keeping old file: ' + e.message);
      if (!existsSync(OUT)) process.exit(0);
      return;
    }
  } else {
    console.warn('[sitemap] Missing Supabase env, keeping old file.');
    if (!existsSync(OUT)) process.exit(0);
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: SITE_URL + '/', changefreq: 'daily', priority: '1.0', lastmod: today },
    ...apartments.map((a) => ({
      loc: SITE_URL + '/can-ho/' + toSeoSlug(a),
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: today,
    })),
  ];
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map(
        (u) =>
          '  <url>\n    <loc>' +
          esc(u.loc) +
          '</loc>\n    <lastmod>' +
          u.lastmod +
          '</lastmod>\n    <changefreq>' +
          u.changefreq +
          '</changefreq>\n    <priority>' +
          u.priority +
          '</priority>\n  </url>'
      )
      .join('\n') +
    '\n</urlset>\n';

  writeFileSync(OUT, xml, 'utf8');
  console.log(`[sitemap] Wrote ${urls.length} urls -> public/sitemap.xml`);
}

main().catch((e) => {
  console.warn('[sitemap] Failed, keeping old file: ' + e.message);
});
