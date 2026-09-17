import { useEffect, useRef, useState } from 'react';
import { Calendar, Clock, ExternalLink, Film, Globe, Loader2, Star, Tv, X } from 'lucide-react';
import Badge from '../common/Badge';

export default function MovieModal({ movie, onClose }) {
  const modalRef = useRef(null);
  const [backdropLoading, setBackdropLoading] = useState(true);
  const [backdropError, setBackdropError] = useState(false);

  useEffect(() => {
    setBackdropLoading(true);
    setBackdropError(false);
  }, [movie?.id]);

  // Close on Escape key press and manage body scroll locking
  useEffect(() => {
    if (!movie) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Lock background scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    // Focus modal container
    modalRef.current?.focus();

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [movie, onClose]);

  if (!movie) return null;

  const backdropImage = movie.image?.original || movie.image?.medium;

  // Split summary paragraphs for structured reading
  const summaryParagraphs = movie.summary
    ? movie.summary.split('\n\n').filter(Boolean)
    : ['No description available for this title.'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-movie-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-dark-800 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl shadow-black/80 my-auto text-left outline-none flex flex-col max-h-[92vh]"
      >
        {/* Top-Right Close Button (✕) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-dark-900/80 hover:bg-dark-900 text-slate-300 hover:text-white backdrop-blur-md border border-slate-700/60 transition-all hover:scale-110 shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <X size={20} />
        </button>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1">
          {/* Movie Backdrop / Large Poster Header */}
          <div className="relative w-full h-56 sm:h-72 md:h-80 bg-slate-900 overflow-hidden">
            {backdropImage && !backdropError ? (
              <>
                {backdropLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-10">
                    <Loader2 size={32} className="animate-spin text-rose-500" />
                  </div>
                )}
                <img
                  src={backdropImage}
                  alt={movie.title}
                  onLoad={() => setBackdropLoading(false)}
                  onError={() => {
                    setBackdropError(true);
                    setBackdropLoading(false);
                  }}
                  className={`w-full h-full object-cover object-top transition-all duration-500 ${
                    backdropLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                  }`}
                />
                {/* Gradient vignette overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-800 via-dark-800/40 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-dark-800/60 to-transparent pointer-events-none" />
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-dark-900 text-slate-500">
                <Film size={64} className="stroke-[1.2] mb-3 text-slate-600" />
                <span className="text-sm font-medium text-slate-400">Movie Backdrop Preview</span>
              </div>
            )}

            {/* Quick floating badges over backdrop */}
            <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 z-20 flex flex-wrap items-center gap-2">
              {movie.rating && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/70 text-amber-400 text-xs sm:text-sm font-bold shadow-md">
                  <Star size={15} className="fill-amber-400 text-amber-400" />
                  <span>{movie.rating} / 10</span>
                </div>
              )}

              {movie.year && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/70 text-slate-200 text-xs sm:text-sm font-medium shadow-md">
                  <Calendar size={14} className="text-rose-400" />
                  <span>{movie.year}</span>
                </div>
              )}

              {movie.status && (
                <Badge variant={movie.status === 'Ended' ? 'default' : 'success'} size="md">
                  {movie.status}
                </Badge>
              )}
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-7 space-y-6">
            {/* Title and release info */}
            <div>
              <h2
                id="modal-movie-title"
                className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight"
              >
                {movie.title}
              </h2>

              {/* Sub-headline / metadata strip matching wireframe */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-2 text-sm text-slate-400">
                <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                  ⭐ Rating: {movie.rating ? movie.rating : 'Not Rated'}
                </span>
                <span className="text-slate-600">|</span>
                <span className="inline-flex items-center gap-1 text-slate-300">
                  📅 Release: {movie.premiered || movie.year}
                </span>
                {movie.runtime && (
                  <>
                    <span className="text-slate-600">|</span>
                    <span className="inline-flex items-center gap-1 text-slate-300">
                      <Clock size={14} className="text-slate-400" />
                      <span>{movie.runtime} min</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Genres
                </span>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <Badge key={genre} variant="primary" size="md">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Overview / Summary */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-2">
                Overview
              </h4>
              <div className="text-slate-300 leading-relaxed text-sm sm:text-base space-y-3 font-normal">
                {summaryParagraphs.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>

            {/* Additional Show Metadata Grid */}
            <div className="bg-dark-900/70 border border-slate-800 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400 block text-xs">Language</span>
                <span className="font-semibold text-slate-200">{movie.language || 'English'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Network / Channel</span>
                <span className="font-semibold text-slate-200">{movie.network || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Premiered</span>
                <span className="font-semibold text-slate-200">{movie.premiered}</span>
              </div>
            </div>

            {/* External Links */}
            {(movie.officialSite || movie.tvmazeUrl) && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {movie.officialSite && (
                  <a
                    href={movie.officialSite}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors"
                  >
                    <Globe size={14} className="text-rose-400" />
                    <span>Official Website</span>
                    <ExternalLink size={12} className="text-slate-400" />
                  </a>
                )}
                {movie.tvmazeUrl && (
                  <a
                    href={movie.tvmazeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors"
                  >
                    <Tv size={14} className="text-blue-400" />
                    <span>TVMaze Profile</span>
                    <ExternalLink size={12} className="text-slate-400" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Bottom Close Button [ ❌ Close ] */}
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-dark-900/90 flex justify-end items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-sm font-semibold border border-slate-700/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="text-rose-500 font-bold">✕</span>
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
