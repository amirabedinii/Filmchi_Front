import { useEffect } from 'react';
import { Grid, Skeleton, Stack, Typography, Button, Box } from '@mui/material';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { addMovieToList, fetchUserList, removeMovieFromList, type Movie } from '../api/movies';
import { MovieCard } from '../components/MovieCard';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export const ListPage = () => {
  const { listName = 'watchlist' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const queryKey = ['list', listName];
  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchUserList(listName, pageParam ? Number(pageParam) : 1),
    getNextPageParam: (lastPage) => lastPage.nextCursor ? String(lastPage.nextCursor) : undefined,
    initialPageParam: "1",
  });

  useEffect(() => {
    const onScroll = () => {
      if (!hasNextPage || isFetchingNextPage) return;
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
      if (nearBottom) fetchNextPage();
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const addMutation = useMutation({
    mutationFn: ({ movie }: { movie: Movie }) => addMovieToList(listName, movie.tmdbId, movie.title),
    onMutate: async ({ movie }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      
      queryClient.setQueryData(queryKey, (old: any) => ({
        ...old,
        pages: old?.pages?.map((page: any) => ({
          ...page,
          items: [...(page.items || []), movie]
        })) || []
      }));
      
      return { previousData };
    },
    onSuccess: () => {
      toast.success('Added to list');
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(queryKey, context?.previousData);
      toast.error('Failed to add');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ movie }: { movie: Movie }) => removeMovieFromList(listName, movie.tmdbId),
    onMutate: async ({ movie }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      
      queryClient.setQueryData(queryKey, (old: any) => ({
        ...old,
        pages: old?.pages?.map((page: any) => ({
          ...page,
          items: page.items?.filter((item: Movie) => item.tmdbId !== movie.tmdbId) || []
        })) || []
      }));
      
      return { previousData };
    },
    onSuccess: () => {
      toast.success('Removed from list');
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(queryKey, context?.previousData);
      toast.error('Failed to remove');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const items = data?.pages.flatMap((p: any) => p.items ?? []).filter(Boolean) ?? [];

  if (isLoading) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={2}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <motion.div variants={itemVariants as any}>
                <Skeleton 
                  variant="rectangular" 
                  height={300} 
                  sx={{ 
                    borderRadius: '16px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }} 
                />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    );
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Stack alignItems="center" spacing={4} sx={{ py: 8 }}>
          <Box 
            role="img" 
            aria-label="movie"
            sx={{ 
              fontSize: '4rem',
              filter: 'grayscale(0.3)',
              transform: 'scale(1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)'
              }
            }}
          >
            🎥
          </Box>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              color: 'text.secondary'
            }}
          >
            لیست خالی است!
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/search')}
            sx={{
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(90,103,216,0.4)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(90,103,216,0.5)',
              }
            }}
          >
            جستجو
          </Button>
        </Stack>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={2}>
          {items.map((movie) => (
            movie && movie.id ? (
              <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
                <motion.div variants={itemVariants as any}>
                  <MovieCard
                    movie={movie}
                    onAdd={(m) => addMutation.mutate({ movie: m })}
                    onRemove={(m) => removeMutation.mutate({ movie: m })}
                  />
                </motion.div>
              </Grid>
            ) : null
          ))}
          {isFetchingNextPage && (
            Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={`loading-${i}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <Skeleton 
                    variant="rectangular" 
                    height={300} 
                    sx={{ 
                      borderRadius: '16px',
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }} 
                  />
                </motion.div>
              </Grid>
            ))
          )}
        </Grid>
      </motion.div>
    </AnimatePresence>
  );
};


