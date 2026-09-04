/**
 * Auth layer — wrap Supabase Auth cho admin.
 *
 * Luồng:
 *   1. Admin đăng nhập bằng email + password qua /admin/login
 *   2. Supabase trả về session (JWT) + user object
 *   3. Session lưu trong localStorage (do supabase-js tự xử lý)
 *   4. RLS policies check role "admin" trong JWT để cho phép write
 *
 * LƯU Ý:
 *   - Hiện tại dùng đơn giản: chỉ cần có session là được coi là admin
 *   - Sau này có thể thêm `app_metadata.role = 'admin'` để phân quyền chi tiết
 *   - File này KHÔNG xoá hash mật khẩu cũ trong `services/authService.ts` (giữ cho
 *     tương thích ngược nếu chưa migrate hết).
 */

import { supabase, isSupabaseEnabled } from './supabase';
import { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  session: Session | null;
  error: string | null;
}

/**
 * Đăng nhập admin bằng email + password.
 * Trả về { user, session } nếu thành công, throw Error nếu thất bại.
 */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ user: User; session: Session }> {
  if (!isSupabaseEnabled() || !supabase) {
    throw new Error('Supabase chưa được cấu hình. Kiểm tra VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY.');
  }
  if (!email || !password) {
    throw new Error('Vui lòng nhập email và mật khẩu.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    // Supabase trả error message tiếng Anh — chuyển sang tiếng Việt
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('Email hoặc mật khẩu không chính xác.');
    }
    if (error.message.includes('Email not confirmed')) {
      throw new Error('Email chưa được xác nhận. Vui lòng kiểm tra hộp thư.');
    }
    throw new Error(`Đăng nhập thất bại: ${error.message}`);
  }

  if (!data.user || !data.session) {
    throw new Error('Đăng nhập thất bại: Không nhận được session.');
  }

  return { user: data.user, session: data.session };
}

/**
 * Đăng xuất admin.
 */
export async function signOut(): Promise<void> {
  if (!isSupabaseEnabled() || !supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('[Auth] signOut error:', error);
  }
}

/**
 * Lấy session hiện tại (nếu có).
 */
export async function getCurrentSession(): Promise<Session | null> {
  if (!isSupabaseEnabled() || !supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('[Auth] getSession error:', error);
    return null;
  }
  return data.session;
}

/**
 * Lấy user hiện tại (nếu có).
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseEnabled() || !supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('[Auth] getUser error:', error);
    return null;
  }
  return data.user;
}

/**
 * Subscribe vào thay đổi auth state (login/logout).
 * Dùng để sync UI khi user đăng nhập/đăng xuất ở tab khác.
 *
 * @param callback - nhận (event, session) khi state thay đổi
 * @returns unsubscribe function
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
): () => void {
  if (!isSupabaseEnabled() || !supabase) return () => {};
  const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return () => {
    subscription?.subscription?.unsubscribe();
  };
}

/**
 * Đổi mật khẩu admin (cần user đã đăng nhập).
 */
export async function changePassword(newPassword: string): Promise<void> {
  if (!isSupabaseEnabled() || !supabase) {
    throw new Error('Supabase chưa được cấu hình.');
  }
  if (newPassword.length < 6) {
    throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự.');
  }
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    throw new Error(`Đổi mật khẩu thất bại: ${error.message}`);
  }
}

/**
 * Tạo admin user mới (chỉ dùng 1 lần khi setup ban đầu, hoặc qua Supabase Dashboard).
 * Không nên dùng trong UI public.
 */
export async function signUpAdmin(
  email: string,
  password: string
): Promise<User> {
  if (!isSupabaseEnabled() || !supabase) {
    throw new Error('Supabase chưa được cấu hình.');
  }
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { role: 'admin' }, // lưu vào user_metadata
    },
  });
  if (error) {
    throw new Error(`Tạo tài khoản thất bại: ${error.message}`);
  }
  if (!data.user) {
    throw new Error('Không nhận được user từ Supabase.');
  }
  return data.user;
}
