import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Film,
  RefreshCw,
  SearchX,
} from 'lucide-react';
import Pagination from '../components/common/Pagination';
import MovieGrid from '../components/movies/MovieGrid';
import MovieModal from '../components/movies/MovieModal';
import MovieSkeletonGrid from '../components/movies/MovieSkeleton';
import SearchBar from '../components/movies/SearchBar';
import { fetchShows, searchShows } from '../services/tvmaze';

const POPULAR_GENRES = [
  'All',
  'Drama',
  'Action',
  'Comedy',
  'Science-Fiction',
  'Thriller',
  'Crime',
  'Romance',
  'Horror',
  'Adventure',
];

const TOTAL_CATALOG_PAGES = 375;

export default function MovieListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);

  // Load shows catalog or search
  const loadData = useCallback(async (searchQuery, pageNum) => {
    setLoading(true);
    setError(null);
    try {
      if (searchQuery && searchQuery.trim().length > 0) {
        const results = await searchShows(searchQuery);
        setMovies(results);
      } else {
        // TVMaze pages are 0-indexed (Page 1 in UI = API page 0)
        const apiPage = Math.max(0, pageNum - 1);
        const results = await fetchShows(apiPage);
        setMovies(results);
      }
    } catch (err) {
      setError(
        err.message || 'Unable to connect to the movie service. Please check your internet connection.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(query, currentPage);
  }, [query, currentPage, loadData]);

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', newPage.toString());
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (val) => {
    setQuery(val);
  };

  const handleClearSearch = () => {
    setQuery('');
    setSelectedGenre('All');
  };

  // Filter movies by genre if selected
  const filteredMovies = useMemo(() => {
    if (selectedGenre === 'All') {
      return movies;
    }
    return movies.filter(
      (m) => Array.isArray(m.genres) && m.genres.includes(selectedGenre)
    );
  }, [movies, selectedGenre]);

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative">
      {/* Page Header and Search Section */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
          Explore <span className="text-rose-500">Movies & TV Shows</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300">
          Search your favorite titles or browse through over 80,000 shows across TVMaze catalog pages.
        </p>

        {/* Search Bar */}
        <div className="pt-2">
          <SearchBar
            value={query}
            onChange={handleSearchChange}
            onClear={handleClearSearch}
            isLoading={loading && query.trim().length > 0}
          />
        </div>

        {/* Quick Genre Filter Chips */}
        <div className="flex items-center justify-center gap-2 flex-wrap pt-3">
          {POPULAR_GENRES.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedGenre === genre
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 border border-slate-700/50'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header Status & Quick Page Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-8">
        <div className="text-xs sm:text-sm text-slate-400">
          {loading ? (
            <span>Fetching titles...</span>
          ) : query ? (
            <span>
              Search results for <span className="text-rose-400 font-semibold">"{query}"</span>{' '}
              ({filteredMovies.length} found)
            </span>
          ) : (
            <span>
              Catalog <span className="text-rose-400 font-semibold">Page {currentPage}</span> — Showing{' '}
              <span className="text-white font-semibold">{filteredMovies.length}</span> titles
              {selectedGenre !== 'All' && ` in ${selectedGenre}`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {query ? (
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 underline underline-offset-2"
            >
              Clear Search
            </button>
          ) : (
            /* Quick Header Page Switcher */
            !loading &&
            !error && (
              <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-2 py-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
                  title="Previous Page"
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-slate-300 px-1 font-medium">
                  Page <span className="text-white font-bold">{currentPage}</span> / {TOTAL_CATALOG_PAGES}
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= TOTAL_CATALOG_PAGES || loading}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
                  title="Next Page"
                  aria-label="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Content Rendering: Loading, Error, Empty, or Movie Grid */}
      {loading ? (
        <MovieSkeletonGrid count={12} />
      ) : error ? (
        <div className="p-8 sm:p-12 text-center bg-slate-900/60 border border-red-900/40 rounded-3xl max-w-lg mx-auto my-12">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <AlertCircle size={28} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Failed to load movies</h3>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
          <button
            type="button"
            onClick={() => loadData(query, currentPage)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-md transition-colors"
          >
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="p-10 sm:p-16 text-center bg-slate-800/30 border border-slate-800 rounded-3xl max-w-lg mx-auto my-12">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-700/60">
            <SearchX size={28} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No movies or shows found</h3>
          <p className="text-sm text-slate-400 mb-6">
            {query
              ? `We couldn't find any titles matching "${query}". Try another search keyword.`
              : selectedGenre !== 'All'
              ? `No titles match the selected genre "${selectedGenre}" on Catalog Page ${currentPage}.`
              : `There are no titles available on Catalog Page ${currentPage}.`}
          </p>
          <div className="flex items-center justify-center gap-3">
            {query || selectedGenre !== 'All' ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-md transition-colors"
              >
                <Film size={16} />
                <span>Browse All Movies</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-md transition-colors"
              >
                <Film size={16} />
                <span>Return to Page 1</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <MovieGrid
            movies={filteredMovies}
            onSelect={(movie) => setSelectedMovie(movie)}
          />

          {/* Bottom Pagination Bar (active in catalog browse mode) */}
          {!query && (
            <Pagination
              currentPage={currentPage}
              totalPages={TOTAL_CATALOG_PAGES}
              hasNextPage={movies.length > 0}
              disabled={loading}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

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
