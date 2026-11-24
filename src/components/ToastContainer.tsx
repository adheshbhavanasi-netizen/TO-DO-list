import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { ToastMessage } from '../types/task';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2.5 max-w-sm w-[calc(100%-2rem)] sm:w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        return (
          <div
            key={toast.id}
            role={isSuccess ? 'status' : 'alert'}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-md bg-white dark:bg-neutral-900 ${
              isSuccess
                ? 'border-emerald-200 dark:border-emerald-800/80'
                : 'border-red-200 dark:border-red-800/80'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2
                className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
            ) : (
              <AlertCircle
                className="h-4 w-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400"
                aria-hidden="true"
              />
            )}
            <p className="flex-1 text-sm font-medium text-neutral-800 dark:text-neutral-100 leading-snug">
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="shrink-0 p-1 -m-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
