/**
 * Vercel Cron — auto backup DB hàng tuần vào Storage bucket `db-backups`.
 *
 * Vercel gọi GET /api/backup-cron theo lịch trong vercel.json.
 * Kiểu Node (req, res) để tương thích runtime.
 * Auth: Vercel tự gửi header `Authorization: Bearer <CRON_SECRET>`
 * khi env CRON_SECRET được set. Trigger tay:
 * /api/backup-cron?secret=<CRON_SECRET>
 *
 * Env cần (private, KHÔNG tiền tố VITE_):
 *   SUPABASE_URL              = https://xxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY = service_role key (bypass RLS)
 *   CRON_SECRET               = chuỗi ngẫu nhiên dài (tự đặt)
 */

import { createClient } from '@supabase/supabase-js';

const BUCKET = 'db-backups';
const KEEP_LAST = 8;

function getHeader(req, name) {
  const h = (req && req.headers) || {};
  if (typeof h.get === 'function') return h.get(name) || h.get(name.toLowerCase()) || '';
  return h[name] || h[name.toLowerCase()] || '';
}

function getQuery(req, name) {
  if (req && req.query && typeof req.query === 'object' && req.query[name]) {
    return String(req.query[name]);
  }
  return '';
}

export default async function handler(req, res) {
  const send = (status, obj) => {
    if (res && typeof res.status === 'function') {
      res.status(status).json(obj);
      return undefined;
    }
    return new Response(JSON.stringify(obj), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const expected = process.env.CRON_SECRET || '';
  const authHeader = String(getHeader(req, 'authorization')).replace(/^Bearer\s+/i, '');
  const querySecret = String(getQuery(req, 'secret'));
  if (!expected || (authHeader !== expected && querySecret !== expected)) {
    return send(401, { ok: false, error: 'unauthorized' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceKey) {
    return send(500, { ok: false, error: 'missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' });
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
      .filter((n) => n.indexOf('lumi-backup-') === 0)
      .sort()
      .reverse();
    const stale = sorted.slice(KEEP_LAST);
    for (const name of stale) {
      await admin.storage.from(BUCKET).remove([name]);
    }

    return send(200, {
      ok: true,
      file: fname,
      counts: snapshot.counts,
      kept: Math.min(sorted.length, KEEP_LAST),
    });
  } catch (e) {
    return send(500, { ok: false, error: String((e && e.message) || e) });
  }
}
