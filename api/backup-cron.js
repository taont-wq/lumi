/**
 * Vercel Cron — auto backup DB hàng tuần vào Storage bucket `db-backups`.
 *
 * Vercel gọi GET /api/backup-cron theo lịch trong vercel.json.
 * Auth: Vercel tự gửi header `Authorization: Bearer <CRON_SECRET>`
 * khi env CRON_SECRET được set (xem Vercel Docs: Cron Jobs).
 * Cho phép trigger tay: /api/backup-cron?secret=<CRON_SECRET>
 *
 * Env cần (private, KHÔNG tiền tố VITE_):
 *   SUPABASE_URL            = https://xxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY = service_role key (bypass RLS)
 *   CRON_SECRET             = chuỗi ngẫu nhiên dài (tự đặt)
 */

import { createClient } from '@supabase/supabase-js';

const BUCKET = 'db-backups';
const KEEP_LAST = 8;

function unauthorized() {
  return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async function handler(req) {
  const host = req.headers.get('host') || 'localhost';
  const url = new URL(req.url, `https://${host}`);
  const expected = process.env.CRON_SECRET || '';
  const headerAuth = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const querySecret = url.searchParams.get('secret') || '';
  if (!expected || (headerAuth !== expected && querySecret !== expected)) {
    return unauthorized();
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceKey) {
    return new Response(
      JSON.stringify({ ok: false, error: 'missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const { data: buckets, error: bErr } = await admin.storage.listBuckets();
    if (bErr) throw new Error('listBuckets: ' + bErr.message);
    if (!buckets.some((b) => b.name === BUCKET)) {
      const { error: cErr } = await admin.storage.createBucket(BUCKET, { public: false });
      if (cErr) throw new Error('createBucket: ' + cErr.message);
    }

    const [p, a, l, st] = await Promise.all([
      admin.from('projects').select('*'),
      admin.from('apartments').select('*'),
      admin.from('leads').select('*'),
      admin.from('settings').select('*'),
    ]);
    const firstErr = p.error || a.error || l.error || st.error;
    if (firstErr) throw new Error('read: ' + firstErr.message);

    const snapshot = {
      exported_at: new Date().toISOString(),
      counts: {
        projects: p.data.length,
        apartments: a.data.length,
        leads: l.data.length,
        settings: st.data.length,
      },
      tables: { projects: p.data, apartments: a.data, leads: l.data, settings: st.data },
    };
    const fname =
      'lumi-backup-' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.json';
    const { error: uErr } = await admin.storage
      .from(BUCKET)
      .upload(fname, Buffer.from(JSON.stringify(snapshot)), { contentType: 'application/json' });
    if (uErr) throw new Error('upload: ' + uErr.message);

    const { data: files } = await admin.storage.from(BUCKET).list();
    const sorted = (files || [])
      .map((f) => f.name)
      .filter((n) => n.startsWith('lumi-backup-'))
      .sort()
      .reverse();
    const stale = sorted.slice(KEEP_LAST);
    for (const name of stale) {
      await admin.storage.from(BUCKET).remove([name]);
    }

    return new Response(
      JSON.stringify({ ok: true, file: fname, counts: snapshot.counts, kept: Math.min(sorted.length, KEEP_LAST) }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String((e && e.message) || e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
