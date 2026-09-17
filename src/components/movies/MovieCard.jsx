import { useEffect, useState } from 'react';
import { Calendar, Film, Info, Loader2, Star } from 'lucide-react';
import StarRating from '../common/StarRating';

export default function MovieCard({ movie, onSelect }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const posterSrc = !imageError && (movie.image?.original || movie.image?.medium);

  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [movie.id, movie.image?.original, movie.image?.medium]);

  return (
    <div
      onClick={() => onSelect(movie)}
      className="group bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600/80 rounded-2xl overflow-hidden flex flex-col shadow-md hover:shadow-xl hover:shadow-rose-950/20 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(movie);
        }
      }}
      aria-label={`View details for ${movie.title}`}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full bg-slate-900 overflow-hidden">
        {posterSrc ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
                <Loader2 size={26} className="animate-spin text-rose-500" />
              </div>
            )}
            <img
              src={posterSrc}
              alt={movie.title}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
              loading="lazy"
              className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ease-out ${
                imageLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/90 text-slate-500 p-4 text-center">
            <Film size={44} className="stroke-[1.5] mb-2 text-slate-600" />
            <span className="text-xs font-medium text-slate-400">No Poster Available</span>
          </div>
        )}

        {/* Rating Floating Overlay Badge */}
        <div className="absolute top-3 right-3 z-20 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/60 shadow-lg flex items-center gap-1">
          <Star size={13} className={movie.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-500'} />
          <span className="text-xs font-bold text-white">
            {movie.rating ? movie.rating : 'NR'}
          </span>
        </div>

        {/* Status or Primary Genre Pill */}
        {movie.genres && movie.genres.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-1 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-dark-900/80 backdrop-blur-md text-[11px] font-medium text-slate-200 border border-slate-700/50">
              {movie.genres[0]}
            </span>
          </div>
        )}
      </div>

      {/* Details Container */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          {/* Title */}
          <h3
            className="font-bold text-white text-base sm:text-lg line-clamp-1 group-hover:text-rose-400 transition-colors"
            title={movie.title}
          >
            {movie.title}
          </h3>

          {/* Meta: Rating and Release Year matching wireframe (⭐ 8.5 • 📅 2024) */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <StarRating rating={movie.rating} />
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1 text-slate-300">
              <Calendar size={13} className="text-slate-400" />
              <span>{movie.year}</span>
            </span>
            {movie.language && (
              <>
                <span className="text-slate-600">•</span>
                <span className="uppercase text-[11px] tracking-wider text-slate-400">
                  {movie.language}
                </span>
              </>
            )}
          </div>
        </div>

        {/* CTA Button: See Details */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(movie);
          }}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-700/60 hover:bg-rose-600 text-slate-200 hover:text-white text-sm font-semibold border border-slate-600/50 hover:border-rose-500 shadow-sm transition-all duration-200 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-500"
        >
          <Info size={16} />
          <span>See Details</span>
        </button>
      </div>
    </div>
  );
}
