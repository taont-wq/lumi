/**
 * Tạo admin user trong Supabase qua Admin API
 * Sử dụng service_role key (KHÔNG có trong client code)
 *
 * Cách chạy:
 *   set SUPABASE_URL=https://xxxxx.supabase.co
 *   set SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
 *   node scripts/create-admin.js
 *
 * Yêu cầu: @supabase/supabase-js đã trong package.json
 */

import { createClient } from '@supabase/supabase-js';

const EMAIL = 'admin@noithatlumi.vn';
const PASSWORD = 'Admin@123';

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Thiếu env vars. Chạy:');
    console.error('   set SUPABASE_URL=https://xxxxx.supabase.co');
    console.error('   set SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...');
    console.error('   node scripts/create-admin.js');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`📋 Đang tạo admin user: ${EMAIL}`);

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      app_metadata: { role: 'admin' },
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        console.log(`⚠️  User đã tồn tại. Đang cập nhật role admin...`);
        const { error: updateError } = await supabase.auth.admin.updateUserByEmail(EMAIL, {
          app_metadata: { role: 'admin' },
        });
        if (updateError) {
          console.error('❌ Lỗi cập nhật:', updateError.message);
          process.exit(1);
        }
        console.log('✅ Role admin đã được cập nhật!');
      } else {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
      }
    } else {
      console.log('✅ Admin user đã tạo thành công!');
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Role: ${data.user.app_metadata?.role}`);
    }
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }

  // Verify
  console.log('\n🔍 Đang verify...');
  const { data: verifyData, error: verifyError } = await supabase.auth.admin.listUsers();
  if (!verifyError && verifyData.users) {
    const adminUser = verifyData.users.find((u) => u.email === EMAIL);
    if (adminUser) {
      console.log('✅ Verify thành công!');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.app_metadata?.role}`);
      console.log(`   Confirmed: ${adminUser.email_confirmed_at ? 'Yes' : 'No'}`);
    }
  }
}

main().catch(console.error);
