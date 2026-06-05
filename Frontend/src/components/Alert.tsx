import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '../utils/cn';

type AlertVariant = 'error' | 'success' | 'info';

type AlertProps = {
  variant?: AlertVariant;
  title?: string;
  message: string;
};

const styles = {
  error: 'border-rose-200 bg-rose-50 text-rose-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
};

const icons = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

export function Alert({ variant = 'info', title, message }: AlertProps) {
  const Icon = icons[variant];
  return (
    <div className={cn('flex gap-3 rounded-xl border p-3 text-sm', styles[variant])}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        <p>{message}</p>
      </div>
    </div>
  );
}
