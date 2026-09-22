import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { fetchShows, isAbortError, searchShows, SHOWS_PER_PAGE, TOTAL_CATALOG_PAGES } from '../services/tvmaze';

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

// Default value per query-string param; params equal to their default are
// omitted from the URL to keep it clean.
const PARAM_DEFAULTS = { page: '1', genre: 'All', q: '' };

export default function MovieListingPage() {
  // All browse state (page, search query, genre) lives in the URL so it
  // survives reload, back/forward navigation, and link sharing.
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const query = searchParams.get('q') || '';
  const selectedGenre = searchParams.get('genre') || 'All';

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  // True once a catalog page comes back short/empty, i.e. we hit the real end
  // of the TVMaze catalog (a page past the end answers HTTP 404 -> []).
  const [reachedEnd, setReachedEnd] = useState(false);

  /**
   * Merge a patch into the current query string. A param is removed when its
   * value is empty/undefined or matches its default, so URLs stay clean
   * (no `?page=1` or `?genre=All`).
   */
  const updateParams = useCallback(
    (patch) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(patch).forEach(([key, value]) => {
          const nextValue = value == null ? '' : String(value);
          if (nextValue === '' || nextValue === PARAM_DEFAULTS[key]) {
            next.delete(key);
          } else {
            next.set(key, nextValue);
          }
        });
        return next;
      });
    },
    [setSearchParams]
  );

  // In-flight request tracking: the newest request wins, older ones are aborted.
  const abortRef = useRef(null);
  const requestIdRef = useRef(0);

  // Load shows catalog or search
  const loadData = useCallback(async (searchQuery, pageNum) => {
    // Cancel any in-flight request so a slow response can't overwrite a newer one.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);
    try {
      let results;
      let atEnd = false;
      if (searchQuery && searchQuery.trim().length > 0) {
        results = await searchShows(searchQuery, { signal: controller.signal });
        atEnd = true; // search results are not paginated
      } else {
        // TVMaze pages are 0-indexed (Page 1 in UI = API page 0)
        const apiPage = Math.max(0, pageNum - 1);
        results = await fetchShows(apiPage, { signal: controller.signal });
        // A short or empty page means there is no next page.
        atEnd = results.length < SHOWS_PER_PAGE;
      }
      // A newer request superseded this one; discard the stale response.
      if (requestId !== requestIdRef.current) return;
      setReachedEnd(atEnd);
      setMovies(results);
    } catch (err) {
      // Aborted requests are intentional, not failures.
      if (isAbortError(err) || requestId !== requestIdRef.current) return;
      setError(
        err.message || 'Unable to connect to the movie service. Please check your internet connection.'
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadData(query, currentPage);
    // Abort the outstanding request when inputs change or the page unmounts.
    return () => abortRef.current?.abort();
  }, [query, currentPage, loadData]);

  const handlePageChange = (newPage) => {
    updateParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (val) => {
    // A new query always restarts from the first page of results.
    updateParams({ q: val, page: '1' });
  };

  const handleClearSearch = () => {
    updateParams({ q: '', genre: 'All', page: '1' });
  };

  const handleGenreChange = (genre) => {
    // Filtering changes the result set, so return to the first page.
    updateParams({ genre, page: '1' });
  };

  // The TVMaze API has no server-side genre filter, so genre filtering can
  // only operate on the currently loaded page/search results. Counts below
  // are computed from that same set to keep the UI honest about scope.
  const genreCounts = useMemo(() => {
    const counts = { All: movies.length };
    movies.forEach((movie) => {
      if (!Array.isArray(movie.genres)) return;
      movie.genres.forEach((genre) => {
        counts[genre] = (counts[genre] || 0) + 1;
      });
    });
    return counts;
  }, [movies]);

  // Filter the loaded page's results by genre if one is selected
  const filteredMovies = useMemo(() => {
    if (selectedGenre === 'All') {
      return movies;
    }
    return movies.filter(
      (m) => Array.isArray(m.genres) && m.genres.includes(selectedGenre)
    );
  }, [movies, selectedGenre]);

  // Pagination bounds: TOTAL_CATALOG_PAGES is only an upper-bound guess.
  // Once a short/empty page proves we've hit the end, clamp to the current
  // page so "last page" and the next button stop pointing past the catalog.
  const effectiveTotalPages = reachedEnd ? currentPage : TOTAL_CATALOG_PAGES;

  const handleSelectMovie = useCallback((movie) => setSelectedMovie(movie), []);
  const handleCloseModal = useCallback(() => setSelectedMovie(null), []);

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

        {/* Quick Genre Filter Chips (scoped to the loaded results) */}
        <div className="flex items-center justify-center gap-2 flex-wrap pt-3">
          {POPULAR_GENRES.map((genre) => {
            const isActive = selectedGenre === genre;
            const count = genreCounts[genre] || 0;
            // Chips with no matches in the loaded results are still selectable
            // (they show an explicit empty state) but are visibly marked.
            const isEmpty = !isActive && count === 0;
            return (
              <button
                key={genre}
                type="button"
                onClick={() => handleGenreChange(genre)}
                aria-pressed={isActive}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : `bg-slate-800/80 hover:text-slate-200 hover:bg-slate-700/60 border border-slate-700/50 ${
                        isEmpty ? 'text-slate-600' : 'text-slate-400'
                      }`
                }`}
              >
                {genre}
                <span className={isActive ? 'text-rose-200' : 'text-slate-600'}>
                  {' '}
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-slate-500">
          Genre filters apply to the {query ? 'search results' : 'titles on this page'} shown
          below, not the entire catalog.
        </p>
      </div>

      {/* Results Header Status & Quick Page Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-8">
        <div className="text-xs sm:text-sm text-slate-400">
          {loading ? (
            <span>Fetching titles...</span>
          ) : query ? (
            <span>
              Search results for <span className="text-rose-400 font-semibold">"{query}"</span>{' '}
              ({filteredMovies.length} of {movies.length} found
              {selectedGenre !== 'All' && ` in ${selectedGenre}`})
            </span>
          ) : (
            <span>
              Catalog <span className="text-rose-400 font-semibold">Page {currentPage}</span> — Showing{' '}
              <span className="text-white font-semibold">{filteredMovies.length}</span>
              {selectedGenre !== 'All' && ` of ${movies.length}`} titles
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
                  Page <span className="text-white font-bold">{currentPage}</span> / {effectiveTotalPages}
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= effectiveTotalPages || loading}
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
              ? selectedGenre !== 'All'
                ? `None of the ${movies.length} results for "${query}" are tagged as ${selectedGenre}. Try clearing the genre filter or searching a different keyword.`
                : `We couldn't find any titles matching "${query}". Try another search keyword.`
              : selectedGenre !== 'All'
              ? `No titles on Catalog Page ${currentPage} match the genre "${selectedGenre}". Genre filters only cover this page — try another page or clear the filter.`
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
        <MovieGrid
          movies={filteredMovies}
          onSelect={handleSelectMovie}
        />
      )}

      {/* Bottom Pagination Bar (active in catalog browse mode).
          Rendered outside the empty/error branches so an empty page never
          strands the user — they can always navigate to another page. */}
      {!query && (
        <Pagination
          currentPage={currentPage}
          totalPages={effectiveTotalPages}
          hasNextPage={!reachedEnd}
          disabled={loading}
          onPageChange={handlePageChange}
        />
      )}

      {/* Movie Details Modal */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
