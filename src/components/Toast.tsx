import { Circle as AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  return (
    <div className="fixed inset-x-0 bottom-24 lg:bottom-6 z-50 flex justify-center px-4 pointer-events-none">
      <div
        role="alert"
        className="pointer-events-auto flex items-center gap-3 w-full max-w-md px-4 py-3 rounded-2xl bg-gray-900 text-white shadow-2xl animate-slide-up"
      >
        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={onDismiss}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Yopish"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
