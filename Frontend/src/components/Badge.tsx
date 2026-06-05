import { cn } from '../utils/cn';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
  PUBLISHED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  SUCCESS: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  FAILED: 'bg-rose-50 text-rose-700 ring-rose-200',
  ADMIN: 'bg-violet-50 text-violet-700 ring-violet-200',
  EMPLOYEE: 'bg-slate-100 text-slate-700 ring-slate-200',
  TELEGRAM: 'bg-sky-50 text-sky-700 ring-sky-200',
  WHATSAPP: 'bg-green-50 text-green-700 ring-green-200',
};

export function Badge({ children, className }: { children: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1', statusStyles[children] || 'bg-slate-100 text-slate-700 ring-slate-200', className)}>
      {children}
    </span>
  );
}
