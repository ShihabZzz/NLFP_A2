import { Star } from 'lucide-react';
import { formatRating } from '../../services/tvmaze';

export default function StarRating({ rating, size = 'sm' }) {
  const iconSize = size === 'lg' ? 18 : 14;
  const textSize = size === 'lg' ? 'text-base font-bold' : 'text-xs font-semibold';
  const displayRating = formatRating(rating);

  if (!displayRating) {
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
      <span>{displayRating}</span>
    </span>
  );
}
