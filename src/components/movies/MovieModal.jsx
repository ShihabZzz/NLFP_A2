import { useEffect, useRef, useState } from 'react';
import { Calendar, Clock, ExternalLink, Film, Globe, Loader2, Star, Tv, X } from 'lucide-react';
import Badge from '../common/Badge';
import { formatRating } from '../../services/tvmaze';

export default function MovieModal({ movie, onClose }) {
  const modalRef = useRef(null);
  const backdropRef = useRef(null);
  const [backdropLoading, setBackdropLoading] = useState(true);
  const [backdropError, setBackdropError] = useState(false);

  const backdropImage = movie?.image?.original || movie?.image?.medium;
  const displayRating = formatRating(movie?.rating);

  // Keep the latest onClose in a ref. Parents pass inline arrows whose
  // identity changes each render; using onClose directly as an effect dep
  // would tear down and re-add the key listener and body scroll lock on
  // every unrelated parent re-render while the modal is open.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (backdropRef.current?.complete && backdropRef.current?.naturalWidth > 0) {
      setBackdropLoading(false);
    } else {
      setBackdropLoading(true);
    }
    setBackdropError(false);
  }, [movie?.id, backdropImage]);

  // Close on Escape key press and manage body scroll locking.
  // Deps are the modal identity only: onClose is read from its ref so a
  // re-rendered parent can't churn the listener and scroll lock.
  useEffect(() => {
    if (!movie) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCloseRef.current?.();
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
  }, [movie]);

  if (!movie) return null;

  // Split summary paragraphs for structured reading
  const summaryParagraphs = movie.summary
    ? movie.summary.split('\n\n').filter(Boolean)
    : ['No description available for this title.'];

  // External links, deduplicated so the same target is never listed twice
  // (e.g. a show with no official site whose fallback equals its TVMaze URL).
  const externalLinks = [];
  if (movie.officialSite && movie.officialSite !== movie.tvmazeUrl) {
    externalLinks.push({
      key: 'official',
      href: movie.officialSite,
      icon: <Globe size={14} className="text-rose-400" />,
      label: 'Official Website',
    });
  }
  if (movie.tvmazeUrl) {
    externalLinks.push({
      key: 'tvmaze',
      href: movie.tvmazeUrl,
      icon: <Tv size={14} className="text-blue-400" />,
      label: 'TVMaze Profile',
    });
  }

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
                  ref={backdropRef}
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
              {displayRating && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/70 text-amber-400 text-xs sm:text-sm font-bold shadow-md">
                  <Star size={15} className="fill-amber-400 text-amber-400" />
                  <span>{displayRating} / 10</span>
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
                  ⭐ Rating: {displayRating || 'Not Rated'}
                </span>
                <span className="text-slate-600">|</span>
                <span className="inline-flex items-center gap-1 text-slate-300">
                  📅 Release: {movie.premiered || movie.year || 'TBA'}
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
                <span className="font-semibold text-slate-200">
                  {movie.language || 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Network / Channel</span>
                <span className="font-semibold text-slate-200">
                  {movie.network || 'Not listed'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Premiered</span>
                <span className="font-semibold text-slate-200">
                  {movie.premiered || 'Unknown'}
                </span>
              </div>
            </div>

            {/* External Links */}
            {externalLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {externalLinks.map((link) => (
                  <a
                    key={link.key}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors"
                  >
                    {link.icon}
                    <span>{link.label}</span>
                    <ExternalLink size={12} className="text-slate-400" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
