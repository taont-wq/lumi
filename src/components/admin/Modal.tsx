/**
 * Modal - Reusable modal chung cho toàn bộ trang admin.
 *
 * Thay thế window.alert / window.confirm bằng UI modal chuẩn:
 *   - <AlertModal>    - thông báo 1-nút (OK)
 *   - <ConfirmModal>  - xác nhận 2-nút (Cancel / Confirm)
 *   - <InfoModal>     - hiển thị nội dung tự do (HTML/list/log)
 *
 * Dùng thông qua hook useDialog() + <DialogHost /> ở root.
 * Cho phép gọi từ bất kỳ đâu, không cần truyền callback qua props.
 */

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

// =================== Types ===================
type DialogKind = 'alert' | 'confirm' | 'info';
type DialogTone = 'success' | 'error' | 'warning' | 'info';

interface BaseDialog {
  kind: DialogKind;
  tone?: DialogTone;
  title: string;
  message?: string;
  content?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  resolve?: (value: boolean) => void;
}

interface DialogState extends BaseDialog {
  id: number;
}

// =================== Context ===================
export interface DialogApi {
  alert: (title: string, message?: string, tone?: DialogTone) => Promise<void>;
  confirm: (
    title: string,
    message?: string,
    options?: { tone?: DialogTone; confirmText?: string; cancelText?: string }
  ) => Promise<boolean>;
  info: (title: string, content: React.ReactNode) => Promise<void>;
}

const DialogContext = createContext<DialogApi | null>(null);

export const useDialog = (): DialogApi => {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('useDialog() phải được dùng bên trong <DialogHost>');
  }
  return ctx;
};

// =================== DialogHost ===================
export const DialogHost: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialogs, setDialogs] = useState<DialogState[]>([]);

  const closeDialog = useCallback((id: number, value: boolean) => {
    setDialogs((prev) => {
      const d = prev.find((x) => x.id === id);
      if (d?.resolve) d.resolve(value);
      return prev.filter((x) => x.id !== id);
    });
  }, []);

  const push = useCallback((d: Omit<BaseDialog, 'resolve'>) => {
    return new Promise<boolean>((resolve) => {
      const id = Date.now() + Math.random();
      setDialogs((prev) => [...prev, { ...d, id, resolve }]);
    });
  }, []);

  const api: DialogApi = {
    alert: (title, message, tone = 'info') =>
      push({ kind: 'alert', tone, title, message }),
    confirm: (title, message, options = {}) =>
      push({
        kind: 'confirm',
        tone: options.tone || 'warning',
        title,
        message,
        confirmText: options.confirmText,
        cancelText: options.cancelText,
      }),
    info: (title, content) => push({ kind: 'info', tone: 'info', title, content }),
  };

  // ESC đóng confirm/alert
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dialogs.length > 0) {
        const last = dialogs[dialogs.length - 1];
        closeDialog(last.id, false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialogs, closeDialog]);

  return (
    <DialogContext.Provider value={api}>
      {children}
      {dialogs.map((d) => (
        <SingleDialog key={d.id} dialog={d} onClose={(v) => closeDialog(d.id, v)} />
      ))}
    </DialogContext.Provider>
  );
};

// =================== Single Dialog Render ===================
const TONE_STYLES: Record<DialogTone, { icon: any; iconBg: string; iconColor: string; btnBg: string }> = {
  success: {
    icon: CheckCircle2,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    btnBg: 'bg-emerald-600 hover:bg-emerald-700',
  },
  error: {
    icon: AlertCircle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    btnBg: 'bg-red-600 hover:bg-red-700',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    btnBg: 'bg-amber-600 hover:bg-amber-700',
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    btnBg: 'bg-blue-600 hover:bg-blue-700',
  },
};

const SingleDialog: React.FC<{ dialog: DialogState; onClose: (v: boolean) => void }> = ({
  dialog,
  onClose,
}) => {
  const tone = dialog.tone || 'info';
  const { icon: Icon, iconBg, iconColor, btnBg } = TONE_STYLES[tone];
  const confirmText = dialog.confirmText || (dialog.kind === 'confirm' ? 'Xác nhận' : 'Đóng');
  const cancelText = dialog.cancelText || 'Huỷ';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={() => onClose(false)}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close X */}
        <button
          onClick={() => onClose(false)}
          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon + Title */}
        <div className="flex items-start space-x-3">
          <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-base font-bold text-slate-900">{dialog.title}</h3>
          </div>
        </div>

        {/* Body */}
        {dialog.message && (
          <p className="text-sm text-slate-600 leading-relaxed pl-[52px]">{dialog.message}</p>
        )}
        {dialog.content && (
          <div className="text-sm text-slate-600 leading-relaxed pl-[52px]">{dialog.content}</div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-2 pl-[52px]">
          {dialog.kind === 'confirm' ? (
            <>
              <button
                onClick={() => onClose(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                {cancelText}
              </button>
              <button
                onClick={() => onClose(true)}
                className={`px-4 py-2 text-sm font-bold text-white ${btnBg} rounded-xl shadow-sm`}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button
              onClick={() => onClose(true)}
              className={`px-5 py-2 text-sm font-bold text-white ${btnBg} rounded-xl shadow-sm`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
