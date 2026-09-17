import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import MovieListingPage from './pages/MovieListingPage';

// Helper to scroll to top whenever route changes
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-dark-900 text-slate-100">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movies" element={<MovieListingPage />} />
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
