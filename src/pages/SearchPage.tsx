import { useState } from 'react';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  Grid, 
  IconButton, 
  Stack, 
  TextField, 
  Typography, 
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { Search as SearchIcon, Movie as MovieIcon, Close as CloseIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRecommendations, addMovieToList, type Movie, type RecommendedMovie } from '../api/movies';
import { MovieCard } from '../components/MovieCard';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

const searchVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

export const SearchPage = () => {
  const [open, setOpen] = useState(true);
  const [q, setQ] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const listName = params.get('list') || 'watchlist';
  const queryClient = useQueryClient();

  const {
    data: recommendations,
    isLoading,
    error
  } = useQuery({
    queryKey: ['recommendations', searchQuery],
    queryFn: () => getRecommendations(searchQuery),
    enabled: searchQuery.trim().length > 0,
  });


  const addMutation = useMutation({
    mutationFn: ({ movie }: { movie: RecommendedMovie }) => addMovieToList(listName, movie.tmdbId, movie.title),
    onMutate: async ({ movie }) => {
      toast.loading('Adding...', { id: movie.tmdbId.toString() });
    },
    onSuccess: (_data, { movie }) => {
      toast.success(`${movie.title} added to ${listName}`, { id: movie.tmdbId.toString() });
      queryClient.invalidateQueries({ queryKey: ['list', listName] });
    },
    onError: (_e, { movie }) => toast.error('Failed to add', { id: movie.tmdbId.toString() }),
  });

  const handleSearch = () => {
    if (q.trim().length > 0) {
      setSearchQuery(q.trim());
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };


  return (
    <AnimatePresence>
      {open && (
        <Dialog 
          fullWidth 
          maxWidth="md" 
          open={open} 
          onClose={() => { setOpen(false); navigate(-1); }}
          PaperProps={{
            sx: {
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            }
          }}
          BackdropProps={{
            sx: {
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0,0,0,0.3)',
            }
          }}
        >
          <motion.div
            variants={searchVariants as any}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <DialogTitle sx={{ 
              pb: 2, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <MovieIcon color="primary" />
                <Typography variant="h5" fontWeight={600}>
                  Get Movie Recommendations
                </Typography>
              </Stack>
              <IconButton 
                onClick={() => { setOpen(false); navigate(-1); }}
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'error.light',
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
              <Stack spacing={3}>
                <TextField 
                  fullWidth
                  placeholder="Describe your mood or favorite films..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyPress={handleKeyPress}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      fontSize: '1.1rem',
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        }
                      },
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                          borderWidth: '2px',
                        }
                      }
                    }
                  }}
                />

                <Button 
                  variant="contained" 
                  size="large"
                  onClick={handleSearch}
                  disabled={q.trim().length === 0}
                  endIcon={<SearchIcon />}
                  sx={{
                    borderRadius: '12px',
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 14px rgba(90,103,216,0.4)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(90,103,216,0.5)',
                    },
                    '&:disabled': {
                      backgroundColor: 'grey.300',
                      transform: 'none',
                      boxShadow: 'none',
                    }
                  }}
                >
                  Get Recommendations
                </Button>

                {/* Loading State */}
                {isLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={60} thickness={4} />
                  </Box>
                )}

                {/* Error State */}
                {error && (
                  <Typography variant="body1" color="error" align="center" sx={{ py: 2 }}>
                    Failed to get recommendations. Please try again.
                  </Typography>
                )}

                {/* Empty State */}
                {searchQuery.trim().length === 0 && !isLoading && (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      🎬 Ready to discover movies?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Type a movie title, genre, or describe your mood
                    </Typography>
                  </Box>
                )}

                {/* No Results */}
                {searchQuery.trim().length > 0 && (!recommendations || recommendations.length === 0) && !isLoading && !error && (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      🔍 No recommendations found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try describing your mood or favorite movie genres
                    </Typography>
                  </Box>
                )}

                {/* Results Grid */}
                {recommendations && recommendations.length > 0 && (
                  <motion.div
                    variants={gridVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Grid container spacing={2}>
                      {recommendations.map((recommendation) => {
                        const movie: Movie = {
                          id: recommendation.tmdbId.toString(),
                          tmdbId: recommendation.tmdbId,
                          title: recommendation.title,
                          year: recommendation.year,
                          posterUrl: recommendation.posterPath ? `https://image.tmdb.org/t/p/w500${recommendation.posterPath}` : undefined,
                        };
                        
                        return (
                          <Grid item xs={12} sm={6} md={4} key={recommendation.tmdbId} {...({} as any)}>
                            <motion.div variants={itemVariants as any}>
                              <MovieCard 
                                movie={movie} 
                                onAdd={() => addMutation.mutate({ movie: recommendation })}
                                showActions={false}
                                onClick={() => addMutation.mutate({ movie: recommendation })}
                                recommendation={{
                                  reason: recommendation.reason,
                                  overview: recommendation.overview
                                }}
                              />
                            </motion.div>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </motion.div>
                )}
              </Stack>
            </DialogContent>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};


