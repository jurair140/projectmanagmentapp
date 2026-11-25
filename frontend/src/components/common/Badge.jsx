export default function Badge({ children, className = '', variantClass = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantClass} ${className}`}
    >
      {children}
    </span>
  );
}
