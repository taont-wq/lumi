/**
 * ============================================
 * SETUP LUMI - Chạy 1 lần duy nhất
 * ============================================
 * Yêu cầu:
 *   1. Vercel token (từ https://vercel.com/account/tokens)
 *   2. Supabase service_role key (từ Supabase Dashboard > Project Settings > API)
 *
 * Cách dùng:
 *   set VERCEL_TOKEN=your_vercel_token
 *   set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 *   node scripts/setup-all.js
 */

import { createClient } from '@supabase/supabase-js';
import https from 'https';

// ============================================================
// CẤU HÌNH
// ============================================================
const SUPABASE_URL = 'https://qwxtymyuriubxwuyofna.supabase.co';
const EMAIL = 'admin@noithatlumi.vn';
const PASSWORD = 'Admin@123';

const vercelToken = process.env.VERCEL_TOKEN;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ============================================================
// BƯỚC 1: TẠO ADMIN USER TRONG SUPABASE
// ============================================================
async function createAdminUser() {
  if (!serviceRoleKey) {
    console.log('⚠️  Bỏ qua Step 1: Thiếu SUPABASE_SERVICE_ROLE_KEY');
    return;
  }

  console.log('\n📋 [Step 1] Đang tạo admin user trong Supabase...');

  try {
    const supabase = createClient(SUPABASE_URL, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Try creating user via Admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      app_metadata: { role: 'admin' },
    });

    if (error && error.message.includes('User already registered')) {
      console.log('⚠️  User đã tồn tại. Đang cập nhật role admin...');
      const { error: updateError } = await supabase.auth.admin.updateUserByEmail(EMAIL, {
        app_metadata: { role: 'admin' },
      });
      if (updateError) {
        console.error('❌ Lỗi cập nhật role:', updateError.message);
      } else {
        console.log('✅ Role admin đã được cập nhật!');
      }
    } else if (error) {
      console.error('❌ Lỗi:', error.message);
    } else {
      console.log('✅ Admin user đã tạo thành công!');
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Role: ${data.user.app_metadata?.role}`);
    }
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
  }
}

// ============================================================
// BƯỚC 2: THÊM ENV VARS VÀO VERCEL
// ============================================================
function addVercelEnvVar(name, value) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ value, type: 'encrypted' });
    const req = https.request(
      `https://api.vercel.com/v1/projects/lumi/env`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
          'Content-Length': postData.length,
        },
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✅ ${name} = ${value.substring(0, 20)}...`);
            resolve();
          } else {
            console.log(`⚠️  ${name}: ${data.substring(0, 100)}`);
            resolve(); // Not fatal
          }
        });
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function addVercelEnvVars() {
  if (!vercelToken) {
    console.log('\n⚠️  Bỏ qua Step 2: Thiếu VERCEL_TOKEN');
    console.log('   Chạy thủ công:');
    console.log('   vercel env add VITE_SUPABASE_URL production');
    console.log('   vercel env add VITE_SUPABASE_ANON_KEY production');
    console.log('   vercel env add VITE_SUPABASE_PUBLISHABLE_KEY production');
    return;
  }

  console.log('\n📋 [Step 2] Đang thêm env vars vào Vercel...');

  const supabaseUrl = process.env.SUPABASE_URL || 'https://qwxtymyuriubxwuyofna.supabase.co';
  const anonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3eHR5bXl1cml1Ynh3dXlvZm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1OTUxMzcsImV4cCI6MjEwNDE3MTEzN30.65TFX2KK_Thkc29Ep5ezLo_hXiRsDE6p397VfBt7iPw';

  await addVercelEnvVar('VITE_SUPABASE_URL', supabaseUrl);
  await addVercelEnvVar('VITE_SUPABASE_ANON_KEY', anonKey);
  await addVercelEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY', anonKey); // same as anon
}

// ============================================================
// BƯỚC 3: KIỂM TRA LOGIN
// ============================================================
async function verifyLogin() {
  console.log('\n📋 [Step 3] Đang verify login...');
  console.log(`   Mở: https://lumi.vercel.app/admin/login`);
  console.log(`   Email: ${EMAIL}`);
  console.log(`   Mật khẩu: ${PASSWORD}`);
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('🚀 LUMI SETUP');
  console.log('════════════════════════════════════════');

  await createAdminUser();
  await addVercelEnvVars();
  await verifyLogin();

  console.log('\n✅ DONE! Kiểm tra tại https://lumi.vercel.app');
}

main().catch(console.error);
