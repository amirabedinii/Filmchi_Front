import { Movie } from '@/services/movies';
import { Star } from 'lucide-react';

type Props = { movie: Movie };

export default function MovieCard({ movie }: Props) {
  const img = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : 'https://via.placeholder.com/300x450?text=No+Image';
  
  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null;
  const rating = movie.voteAverage ? Math.round(movie.voteAverage * 10) / 10 : null;

  return (
    <div className="w-36 sm:w-40 md:w-44 lg:w-48 shrink-0 group cursor-pointer">
      <div className="aspect-[2/3] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 shadow-sm group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
        <img 
          src={img} 
          alt={movie.title} 
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" 
          loading="lazy"
        />
        {rating && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400" />
            {rating}
          </div>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <div 
          className="text-sm font-medium line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" 
          title={movie.title}
        >
          {movie.title}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          {year && <span>{year}</span>}
          {rating && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400" />
              <span>{rating}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


