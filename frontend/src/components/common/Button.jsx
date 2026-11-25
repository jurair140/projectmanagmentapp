import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/50 shadow-sm shadow-indigo-950/50',
  secondary:
    'bg-[#202A3F] hover:bg-[#27334C] text-slate-200 border border-slate-700/80',
  danger:
    'bg-rose-600/90 hover:bg-rose-500 text-white border border-rose-500/40',
  ghost:
    'bg-transparent hover:bg-slate-800/70 text-slate-300 hover:text-white border border-transparent',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
