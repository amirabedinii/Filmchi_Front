import { Movie } from '@/services/movies';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Props = { movie: Movie };

export default function MovieCard({ movie }: Props) {
  const navigate = useNavigate();
  const img = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : 'https://via.placeholder.com/300x450?text=No+Image';
  
  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null;
  const rating = movie.voteAverage ? Math.round(movie.voteAverage * 10) / 10 : null;

  const handleClick = () => {
    navigate(`/movies/${movie.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="w-32 xs:w-36 sm:w-40 md:w-44 lg:w-48 shrink-0 group cursor-pointer touch-manipulation"
    >
      <div className="aspect-[2/3] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 shadow-sm group-hover:shadow-lg transition-all duration-300 relative">
        <img 
          src={img} 
          alt={movie.title} 
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" 
          loading="lazy"
        />
        {rating && (
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full flex items-center gap-1">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400" />
            <span className="text-xs">{rating}</span>
          </div>
        )}
      </div>
      <div className="mt-2 sm:mt-3 space-y-1">
        <div 
          className="text-xs sm:text-sm font-medium line-clamp-2 sm:line-clamp-1 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors min-h-[2.5rem] sm:h-5" 
          title={movie.title}
        >
          {movie.title}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          {year && <span>{year}</span>}
          {rating && (
            <div className="flex items-center gap-1 sm:hidden">
              <Star className="w-2.5 h-2.5 fill-yellow-400" />
              <span>{rating}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


