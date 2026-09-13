import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Chặn menu chuột phải (Save image as…) khi bấm lên thẻ <img>
 * ở các trang công khai. Trang /admin/* được loại trừ để
 * không ảnh hưởng thao tác quản trị.
 *
 * Lưu ý: chỉ chống copy phổ thông — DevTools/screenshot vẫn lấy được ảnh.
 */
export default function ImageContextMenuGuard() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;
    const onContextMenu = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && el.closest && el.closest('img')) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', onContextMenu);
    return () => document.removeEventListener('contextmenu', onContextMenu);
  }, [pathname]);

  return null;
}
