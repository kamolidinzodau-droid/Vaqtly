import type { ReactNode } from 'react';

interface ViewHeaderProps {
  title: string;
  subtitle: string;
  icon?: ReactNode;
  accent: string;
  right?: ReactNode;
}

export function ViewHeader({ title, subtitle, icon, accent, right }: ViewHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 mb-5 animate-fade-in">
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <span
            className="flex items-center justify-center w-11 h-11 rounded-2xl text-white shadow-lg shrink-0"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent})` }}
          >
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight truncate">
            {title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{subtitle}</p>
        </div>
      </div>
      {right}
    </div>
  );
}
