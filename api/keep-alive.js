/**
 * Vercel Cron — giữ Supabase free khỏi bị pause (pause sau ~7 ngày không activity).
 *
 * Vercel gọi GET /api/keep-alive mỗi ngày theo lịch trong vercel.json.
 * Chỉ đọc nhẹ 1 dòng bảng settings bằng ANON key (không cần service_role).
 * Auth: giống backup-cron — header `Authorization: Bearer <CRON_SECRET>`
 * hoặc trigger tay: /api/keep-alive?secret=<CRON_SECRET>
 *
 * Env cần (private, KHÔNG tiền tố VITE_ cũng được, có fallback VITE_):
 *   SUPABASE_URL / VITE_SUPABASE_URL
 *   SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY
 *   CRON_SECRET (chung với backup-cron)
 */

import { createClient } from '@supabase/supabase-js';

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
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !anonKey) {
    return send(500, { ok: false, error: 'missing SUPABASE_URL or SUPABASE_ANON_KEY' });
  }

  try {
    const supabase = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase.from('settings').select('id').limit(1);
    if (error) throw new Error(error.message);
    return send(200, { ok: true, at: new Date().toISOString() });
  } catch (e) {
    return send(500, { ok: false, error: String((e && e.message) || e) });
  }
}
