import type { ReactNode } from 'react';

type EmptyStateProps = {
  message: string;
  action?: ReactNode;
};

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800" />
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{message}</p>
      {action}
    </div>
  );
}
