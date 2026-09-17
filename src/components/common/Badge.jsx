export default function Badge({ children, variant = 'default', size = 'sm' }) {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700/60',
    primary: 'bg-brand-500/10 text-brand-500 border-brand-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    accent: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variants[variant] || variants.default} ${sizes[size] || sizes.sm}`}
    >
      {children}
    </span>
  );
}
