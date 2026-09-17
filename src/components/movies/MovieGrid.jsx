import MovieCard from './MovieCard';

export default function MovieGrid({ movies, onSelect }) {
  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onSelect={onSelect} />
      ))}
    </div>
  );
}
