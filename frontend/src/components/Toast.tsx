import React from 'react';
import { usePrompts } from '../context/PromptContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = usePrompts();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bgColor = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100';
        let Icon = Info;
        let iconColor = 'text-blue-500';

        if (toast.type === 'success') {
          bgColor = 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-slate-800 dark:text-slate-100';
          Icon = CheckCircle;
          iconColor = 'text-emerald-500';
        } else if (toast.type === 'error') {
          bgColor = 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-slate-800 dark:text-slate-100';
          Icon = AlertCircle;
          iconColor = 'text-rose-500';
        }

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg pointer-events-auto transition-all duration-300 transform translate-y-0 ${bgColor}`}
            role="alert"
          >
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
            <div className="flex-1 text-sm font-medium">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
