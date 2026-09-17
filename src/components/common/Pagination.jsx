import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Pagination component for navigating catalog pages
 *
 * @param {Object} props
 * @param {number} props.currentPage - Current active page (1-indexed)
 * @param {number} [props.totalPages=375] - Total available pages in TVMaze catalog
 * @param {boolean} [props.hasNextPage=true] - Whether next page has content
 * @param {boolean} [props.disabled=false] - Disable controls while fetching
 * @param {Function} props.onPageChange - Handler receiving new page number
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 375,
  hasNextPage = true,
  disabled = false,
  onPageChange,
}) {
  const [jumpInput, setJumpInput] = useState('');

  const handlePageClick = (page) => {
    if (page === currentPage || disabled || page < 1) return;
    if (totalPages && page > totalPages) return;
    onPageChange(page);
  };

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const target = parseInt(jumpInput.trim(), 10);
    if (!Number.isNaN(target) && target >= 1 && (!totalPages || target <= totalPages)) {
      setJumpInput('');
      onPageChange(target);
    }
  };

  // Generate pagination buttons window around current page
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    // Always include page 1
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('ellipsis-start');
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Always include last page
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('ellipsis-end');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const canGoPrevious = currentPage > 1 && !disabled;
  const canGoNext = hasNextPage && (!totalPages || currentPage < totalPages) && !disabled;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 border-t border-slate-800/80">
      {/* Page Info */}
      <div className="text-xs sm:text-sm text-slate-400 order-2 sm:order-1">
        Page <span className="font-semibold text-white">{currentPage}</span>
        {totalPages && (
          <>
            {' '}of <span className="font-semibold text-white">{totalPages}</span>
          </>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center order-1 sm:order-2">
        {/* First Page Button */}
        <button
          type="button"
          onClick={() => handlePageClick(1)}
          disabled={!canGoPrevious}
          className={`p-2 rounded-xl border transition-all text-xs font-semibold flex items-center justify-center ${
            canGoPrevious
              ? 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-500 shadow-sm cursor-pointer'
              : 'bg-slate-900/40 border-slate-800/50 text-slate-600 cursor-not-allowed opacity-50'
          }`}
          title="First page"
          aria-label="First page"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Previous Page Button */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={!canGoPrevious}
          className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl border transition-all text-xs font-semibold ${
            canGoPrevious
              ? 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-500 shadow-sm cursor-pointer'
              : 'bg-slate-900/40 border-slate-800/50 text-slate-600 cursor-not-allowed opacity-50'
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Numbered Page Buttons */}
        {pageNumbers.map((p, idx) => {
          if (p === 'ellipsis-start' || p === 'ellipsis-end') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 py-1 text-slate-600 text-xs select-none"
              >
                •••
              </span>
            );
          }

          const isCurrent = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => handlePageClick(p)}
              disabled={disabled || isCurrent}
              className={`min-w-[36px] h-9 px-2.5 rounded-xl border text-xs font-semibold transition-all ${
                isCurrent
                  ? 'bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-600/30 cursor-default'
                  : 'bg-slate-800/70 border-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 cursor-pointer'
              }`}
              aria-current={isCurrent ? 'page' : undefined}
            >
              {p}
            </button>
          );
        })}

        {/* Next Page Button */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={!canGoNext}
          className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl border transition-all text-xs font-semibold ${
            canGoNext
              ? 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-500 shadow-sm cursor-pointer'
              : 'bg-slate-900/40 border-slate-800/50 text-slate-600 cursor-not-allowed opacity-50'
          }`}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={16} />
        </button>

        {/* Last Page Button */}
        {totalPages && (
          <button
            type="button"
            onClick={() => handlePageClick(totalPages)}
            disabled={!canGoNext}
            className={`p-2 rounded-xl border transition-all text-xs font-semibold flex items-center justify-center ${
              canGoNext
                ? 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-500 shadow-sm cursor-pointer'
                : 'bg-slate-900/40 border-slate-800/50 text-slate-600 cursor-not-allowed opacity-50'
            }`}
            title="Last page"
            aria-label="Last page"
          >
            <ChevronsRight size={16} />
          </button>
        )}
      </div>

      {/* Jump to Page Form */}
      <form
        onSubmit={handleJumpSubmit}
        className="flex items-center gap-2 order-3 text-xs text-slate-400"
      >
        <span>Go to:</span>
        <input
          type="number"
          min="1"
          max={totalPages || undefined}
          value={jumpInput}
          onChange={(e) => setJumpInput(e.target.value)}
          placeholder="Page"
          className="w-16 px-2 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-white text-xs text-center focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-slate-600"
        />
        <button
          type="submit"
          disabled={disabled || !jumpInput.trim()}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white border border-slate-700 hover:border-rose-500 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Go
        </button>
      </form>
    </div>
  );
}
