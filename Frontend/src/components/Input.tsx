import type { InputHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id || props.name;

  return (
    <label className="block space-y-1.5" htmlFor={inputId}>
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
      <input
        id={inputId}
        className={cn(
          'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100',
          error && 'border-rose-300 focus:border-rose-400 focus:ring-rose-100',
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs font-medium text-rose-600">{error}</span>}
    </label>
  );
}
