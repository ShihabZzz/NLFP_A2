import { Star } from 'lucide-react';

export default function StarRating({ rating, size = 'sm' }) {
  const iconSize = size === 'lg' ? 18 : 14;
  const textSize = size === 'lg' ? 'text-base font-bold' : 'text-xs font-semibold';

  if (!rating) {
    return (
      <span className={`inline-flex items-center gap-1 text-slate-400 ${textSize}`}>
        <Star size={iconSize} className="text-slate-500 fill-slate-700/50" />
        <span>NR</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 text-amber-400 ${textSize}`}>
      <Star size={iconSize} className="fill-amber-400 text-amber-400" />
      <span>{rating}</span>
    </span>
  );
}
