/**
 * migrate-base64-to-storage.js — chạy 1 LẦN để chuyển ảnh base64 cũ trong DB lên Supabase Storage.
 *
 * Vì sao: ảnh base64 phình mỗi dòng apartments lên hàng MB -> trang load chậm,
 * lưu hay timeout. Script này tải từng ảnh base64, upload lên bucket
 * apartment-images, rồi update dòng đó thành URL https gọn nhẹ.
 * Các field khác giữ nguyên 100%.
 *
 * Cách chạy (local, KHÔNG commit key):
 *   $env:ADMIN_EMAIL='admin@noithatlumi.vn'; $env:ADMIN_PASSWORD='...'; $env:SUPABASE_URL='https://xxx.supabase.co'; $env:SUPABASE_ANON_KEY='...'; node scripts/migrate-base64-to-storage.js
 */

import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const EMAIL = process.env.ADMIN_EMAIL || '';
const PASSWORD = process.env.ADMIN_PASSWORD || '';

if (!URL || !KEY || !EMAIL || !PASSWORD) {
  console.error('Thieu SUPABASE_URL / SUPABASE_ANON_KEY / ADMIN_EMAIL / ADMIN_PASSWORD');
  process.exit(1);
}

const MIME_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

function parseDataUrl(dataUrl) {
  const m = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(dataUrl || '');
  if (!m) return null;
  const mime = m[1] || 'image/jpeg';
  return { mime, buffer: Buffer.from(m[3] || '', 'base64') };
}

const sb = createClient(URL, KEY, { auth: { persistSession: false, autoRefreshToken: false } });

const { error: loginErr } = await sb.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
if (loginErr) {
  console.error('LOGIN_FAIL ' + loginErr.message);
  process.exit(1);
}

const { data: rows, error: selErr } = await sb.from('apartments').select('*');
if (selErr) {
  console.error('SELECT_FAIL ' + selErr.message);
  process.exit(1);
}

let migratedRows = 0;
let migratedImages = 0;

for (const row of rows || []) {
  const jobs = [];
  if (String(row.floor_plan_image_url || '').startsWith('data:')) {
    jobs.push({ kind: 'floorplan', index: -1 });
  }
  (row.interior_images || []).forEach((img, i) => {
    if (String(img?.url || '').startsWith('data:')) jobs.push({ kind: 'interior', index: i });
  });
  if (jobs.length === 0) continue;

  let floorplan = row.floor_plan_image_url;
  const interiors = JSON.parse(JSON.stringify(row.interior_images || []));

  for (const [n, job] of jobs.entries()) {
    const src = job.kind === 'floorplan' ? floorplan : interiors[job.index]?.url;
    const parsed = parseDataUrl(src);
    if (!parsed || parsed.buffer.length === 0) continue;
    const ext = MIME_EXT[parsed.mime] || 'jpg';
    const path = `apt-${row.id}/${job.kind}-${n}-${Date.now()}.${ext}`;
    const { error: upErr } = await sb.storage
      .from('apartment-images')
      .upload(path, parsed.buffer, { contentType: parsed.mime, upsert: false });
    if (upErr) {
      console.warn(`[migrate] ${row.unit_code} upload fail: ${upErr.message}`);
      continue;
    }
    const { data: pub } = sb.storage.from('apartment-images').getPublicUrl(path);
    if (job.kind === 'floorplan') floorplan = pub.publicUrl;
    else interiors[job.index].url = pub.publicUrl;
    migratedImages++;
  }

  const { error: updErr } = await sb
    .from('apartments')
    .update({ floor_plan_image_url: floorplan, interior_images: interiors })
    .eq('id', row.id);
  if (updErr) {
    console.warn(`[migrate] ${row.unit_code} update fail: ${updErr.message}`);
    continue;
  }
  migratedRows++;
  console.log(`[migrate] ${row.unit_code}: ${jobs.length} anh -> Storage`);
}

console.log(`DONE rows=${migratedRows} images=${migratedImages}`);
await sb.auth.signOut();
