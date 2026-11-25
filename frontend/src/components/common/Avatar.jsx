import { getInitials, resolveAvatarUrl } from '../../utils/formatters';

const SIZE_CLASSES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-20 w-20 text-xl',
};

export default function Avatar({ user, size = 'md', className = '' }) {
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const src = resolveAvatarUrl(user?.avatar);
  const name = user?.name || 'User';

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} rounded-full object-cover border border-slate-700/80 bg-slate-800 shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      title={name}
      className={`${sizeClass} rounded-full bg-indigo-600/25 border border-indigo-500/40 text-indigo-200 font-semibold flex items-center justify-center shrink-0 ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
