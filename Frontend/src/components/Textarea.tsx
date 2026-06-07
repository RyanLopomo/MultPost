import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id || props.name;

  return (
    <label className="block space-y-1.5" htmlFor={inputId}>
      {label && <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>}
      <textarea
        id={inputId}
        className={cn(
          'min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-800',
          error && 'border-rose-300 focus:border-rose-400 focus:ring-rose-100 dark:border-rose-500 dark:focus:ring-rose-950',
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs font-medium text-rose-600">{error}</span>}
    </label>
  );
}
