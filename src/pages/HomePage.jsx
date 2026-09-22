import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, Compass, Flame, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import MovieGrid from '../components/movies/MovieGrid';
import MovieModal from '../components/movies/MovieModal';
import MovieSkeletonGrid from '../components/movies/MovieSkeleton';
import { fetchShows } from '../services/tvmaze';

export default function HomePage() {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  // Bumped to refetch; used by the error state's "Try Again" button.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadFeatured() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchShows(0);
        if (!isMounted) return;
        // Select top rated or first 4 shows to showcase (1 row)
        const sorted = [...data]
          .filter((m) => m.rating && (m.image?.original || m.image?.medium))
          .sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setFeaturedMovies(sorted.slice(0, 4));
        // Surface a failure instead of leaving an empty section with no cause.
        if (sorted.length === 0) {
          setFeaturedMovies([]);
          setError('No featured titles are available right now.');
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load featured movies:', err);
        // Clear stale results so an error is never hidden behind old data.
        setFeaturedMovies([]);
        setError(
          err.message ||
            'Unable to load featured titles. Please check your internet connection.'
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadFeatured();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 py-24 sm:py-32 lg:py-36 border-b border-slate-800/80">
        {/* Cinematic Backdrop Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-900/25 via-dark-900/60 to-dark-900 pointer-events-none" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-rose-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Subtle Tag Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
            <Sparkles size={15} />
            <span>Unlimited Movie & Series Exploration</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase drop-shadow-sm">
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-400">Movies</span>
          </h1>

          {/* Description */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Explore and discover your favorite movies and shows from around the world.
            Search titles, browse ratings, and read full summaries in high definition.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/movies"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-base shadow-xl shadow-rose-600/30 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Compass size={20} />
              <span>Explore Now</span>
              <ArrowRight size={18} />
            </Link>

            <a
              href="#featured"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-base border border-slate-700/70 transition-all hover:scale-105 active:scale-95"
            >
              <TrendingUp size={18} className="text-rose-400" />
              <span>View Featured</span>
            </a>
          </div>

          {/* Value props badges */}
          <div className="mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-center max-w-2xl mx-auto text-xs sm:text-sm text-slate-400">
            <div className="flex flex-col items-center gap-1">
              <span className="font-extrabold text-white text-lg sm:text-xl">10,000+</span>
              <span>Titles Cataloged</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-extrabold text-amber-400 text-lg sm:text-xl">⭐ 8.5+</span>
              <span>Top-Rated TV Shows</span>
            </div>
            <div className="col-span-2 sm:col-span-1 flex flex-col items-center gap-1">
              <span className="font-extrabold text-rose-500 text-lg sm:text-xl">100% Free</span>
              <span>Powered by TVMaze</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured / Trending Section */}
      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-rose-500 text-xs font-bold uppercase tracking-wider mb-2">
              <Flame size={16} />
              <span>Trending Highlights</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Featured Top-Rated Shows
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Hand-picked audience favorites with acclaimed critic and viewer ratings.
            </p>
          </div>

          <Link
            to="/movies"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-400 hover:text-rose-300 transition-colors"
          >
            <span>View All Movies & Shows</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <MovieSkeletonGrid count={4} />
        ) : error ? (
          <div className="p-8 sm:p-12 text-center bg-slate-900/60 border border-red-900/40 rounded-3xl max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <AlertCircle size={28} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Couldn't load featured shows
            </h3>
            <p className="text-sm text-slate-400 mb-6">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-md transition-colors"
            >
              <RefreshCw size={16} />
              <span>Try Again</span>
            </button>
          </div>
        ) : (
          <MovieGrid movies={featuredMovies} onSelect={(movie) => setSelectedMovie(movie)} />
        )}
      </section>

      {/* Movie Details Modal */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}
