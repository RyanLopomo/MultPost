import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('w-full overflow-x-auto', className)}><table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-sm">{children}</table></div>;
}

export function Th({ children }: { children: ReactNode }) {
  return <th className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">{children}</th>;
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn('border-b border-slate-100 px-4 py-3 align-middle text-slate-700 dark:border-slate-800 dark:text-slate-300', className)}>{children}</td>;
}
