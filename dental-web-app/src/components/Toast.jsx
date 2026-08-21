import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const bgStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-emerald-500/10',
    error: 'bg-rose-50 border-rose-200 text-rose-900 shadow-rose-500/10',
    info: 'bg-teal-50 border-teal-200 text-teal-900 shadow-teal-500/10',
  }[type];

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-teal-600 shrink-0" />,
  };

  return (
    <div className="fixed top-20 right-4 z-50 animate-bounce">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md max-w-sm ${bgStyles}`}
      >
        {icons[type]}
        <span className="text-xs font-bold">{message}</span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
