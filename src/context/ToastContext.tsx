import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'sms';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  showSmsToast: (recipient: string, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string, duration = 4500) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, type, title, message, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const showSmsToast = useCallback((recipient: string, message: string) => {
    showToast('sms', `Transactional SMS Sent to ${recipient}`, message, 7000);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSmsToast }}>
      {children}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map(toast => {
            let bg = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100';
            let Icon = Info;
            let iconColor = 'text-sky-500';

            if (toast.type === 'success') {
              Icon = CheckCircle2;
              iconColor = 'text-emerald-500';
            } else if (toast.type === 'error') {
              Icon = AlertCircle;
              iconColor = 'text-rose-500';
            } else if (toast.type === 'warning') {
              Icon = AlertTriangle;
              iconColor = 'text-amber-500';
            } else if (toast.type === 'sms') {
              Icon = MessageSquare;
              iconColor = 'text-cyan-500';
              bg = 'bg-slate-900 dark:bg-slate-950 border-cyan-500/40 text-slate-100 shadow-cyan-500/10 shadow-lg';
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto rounded-xl border p-4 shadow-xl backdrop-blur-md flex items-start gap-3 ${bg}`}
              >
                <div className="shrink-0 mt-0.5">
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-semibold">{toast.title}</p>
                  {toast.message && (
                    <p className={`mt-0.5 text-xs leading-relaxed ${toast.type === 'sms' ? 'text-slate-300 font-mono text-[11px]' : 'text-slate-600 dark:text-slate-400'}`}>
                      {toast.message}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
