import React from 'react';
import { useShop } from '../context/ShopContext';
import { Check, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useShop();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-[#191918] text-white p-3.5 rounded-lg shadow-xl border border-stone-800 flex items-start gap-3 transition-all transform animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="w-5 h-5 rounded-full bg-stone-800 flex items-center justify-center shrink-0 mt-0.5 text-stone-300">
            <Check className="w-3 h-3" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white">{toast.title}</p>
            {toast.subtitle && (
              <p className="text-[11px] text-stone-400 truncate mt-0.5">{toast.subtitle}</p>
            )}
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-stone-400 hover:text-white p-0.5 rounded"
            aria-label="Dismiss toast"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
