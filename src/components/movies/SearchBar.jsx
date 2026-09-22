import { useEffect, useRef, useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';

export default function SearchBar({
  value,
  onChange,
  onClear,
  isLoading = false,
  placeholder = 'Search for a movie or show by title...',
}) {
  const [internalValue, setInternalValue] = useState(value);

  // Hold the latest callbacks in refs. Parent components typically pass
  // inline arrows, whose identity changes on every render; using them
  // directly as effect deps would tear down and restart the debounce timer
  // on unrelated re-renders (e.g. a loading flag flipping), potentially
  // postponing the search indefinitely.
  const onChangeRef = useRef(onChange);
  const onClearRef = useRef(onClear);
  useEffect(() => {
    onChangeRef.current = onChange;
    onClearRef.current = onClear;
  });

  // Sync internal state if parent changes externally (clear, back nav)
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounce search update to parent
  useEffect(() => {
    if (internalValue === value) return;
    const timer = setTimeout(() => {
      onChangeRef.current?.(internalValue);
    }, 400);
    return () => clearTimeout(timer);
  }, [internalValue, value]);

  const handleInputChange = (e) => {
    setInternalValue(e.target.value);
  };

  const handleClear = () => {
    setInternalValue('');
    if (onClearRef.current) {
      onClearRef.current();
    } else {
      onChangeRef.current?.('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onChangeRef.current?.(internalValue);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full relative max-w-2xl mx-auto">
      <div className="relative flex items-center">
        {/* Search Icon */}
        <div className="absolute left-4 pointer-events-none text-slate-400">
          <Search size={20} className="stroke-[2.2]" />
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={internalValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          aria-label="Search movies"
          className="w-full pl-12 pr-24 py-3.5 sm:py-4 bg-slate-800/90 hover:bg-slate-800 focus:bg-slate-800/95 text-white placeholder-slate-400 rounded-2xl border border-slate-700/70 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 shadow-lg shadow-black/20 outline-none transition-all text-sm sm:text-base"
        />

        {/* Action icons right side: spinner & clear button */}
        <div className="absolute right-3.5 flex items-center gap-1.5">
          {isLoading && Boolean(internalValue?.trim()) && (
            <Loader2 size={18} className="animate-spin text-rose-500 mr-1" />
          )}

          {internalValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
              aria-label="Clear search text"
            >
              <X size={16} />
            </button>
          )}

          <button
            type="submit"
            className="hidden sm:inline-flex items-center px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow transition-colors"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
