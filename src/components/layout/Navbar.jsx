import { Link, NavLink, useLocation } from 'react-router-dom';
import { Clapperboard, Film } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-dark-900/80 border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group transition-transform active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-400 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1">
                Movie<span className="text-rose-500">Explorer</span>
              </span>
            </div>
          </Link>

          {/* Navigation - Movies Button with animated border */}
          <nav className="flex items-center">
            <NavLink
              to="/movies"
              onClick={(e) => e.currentTarget.blur()}
              className={({ isActive }) =>
                `movie-btn-group relative inline-flex items-center justify-center p-[1.5px] rounded-xl overflow-hidden transition-all duration-300 active:scale-[0.98] ${
                  isActive ? 'shadow-md shadow-rose-500/10' : ''
                }`
              }
            >
              {/* Static border layer */}
              <span
                className="movie-btn-border absolute inset-0 rounded-xl bg-slate-800/80 border border-slate-700/60 transition-colors duration-300"
              />

              {/* Animated rotating gradient border beam on hover (strictly border only, hover-enabled devices) */}
              <span
                className="movie-btn-beam absolute inset-[-250%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_200deg,#f43f5e_260deg,#fb7185_310deg,#fbbf24_350deg,#f43f5e_360deg)] animate-border-spin opacity-0 transition-opacity duration-300 pointer-events-none"
              />

              {/* Inner button surface: solid opaque bg-dark-900 to eliminate any inside glowing bleed */}
              <span
                className={`relative z-10 flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-[10px] text-xs sm:text-sm font-semibold bg-dark-900 transition-colors duration-200 ${
                  location.pathname === '/movies'
                    ? 'text-white'
                    : 'text-slate-300'
                }`}
              >
                <Clapperboard className="movie-btn-icon w-4 h-4 text-rose-500 transition-transform duration-300" />
                <span>Movies</span>
              </span>
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
