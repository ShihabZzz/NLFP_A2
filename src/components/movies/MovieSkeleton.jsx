function MovieCardSkeleton() {
  return (
    <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl overflow-hidden flex flex-col animate-pulse">
      {/* Poster skeleton */}
      <div className="aspect-[2/3] w-full bg-slate-700/50" />

      {/* Content skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-2">
          {/* Title skeleton */}
          <div className="h-5 bg-slate-700/60 rounded w-4/5" />
          
          {/* Meta skeleton */}
          <div className="flex items-center gap-3">
            <div className="h-4 bg-slate-700/50 rounded w-12" />
            <div className="h-4 bg-slate-700/50 rounded w-16" />
          </div>

          {/* Genre skeleton */}
          <div className="flex gap-1.5 pt-1">
            <div className="h-4 bg-slate-700/40 rounded-full w-14" />
            <div className="h-4 bg-slate-700/40 rounded-full w-12" />
          </div>
        </div>

        {/* Button skeleton */}
        <div className="h-9 bg-slate-700/60 rounded-xl w-full mt-2" />
      </div>
    </div>
  );
}

export default function MovieSkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <MovieCardSkeleton key={index} />
      ))}
    </div>
  );
}
