import { useEffect } from 'react';
import { Grid, Skeleton, Stack, Typography, Button, Box } from '@mui/material';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { addMovieToList, fetchUserList, removeMovieFromList, type Movie } from '../api/movies';
import { MovieCard } from '../components/MovieCard';
import toast from 'react-hot-toast';

export const ListPage = () => {
  const { listName = 'favorites' } = useParams();
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
    queryFn: ({ pageParam }) => fetchUserList(listName, pageParam as string | undefined),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
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
    mutationFn: ({ movie }: { movie: Movie }) => addMovieToList(listName, movie.id),
    onSuccess: () => {
      toast.success('Added to list');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: () => toast.error('Failed to add'),
  });

  const removeMutation = useMutation({
    mutationFn: ({ movie }: { movie: Movie }) => removeMovieFromList(listName, movie.id),
    onSuccess: () => {
      toast.success('Removed from list');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: () => toast.error('Failed to remove'),
  });

  const items = data?.pages.flatMap((p) => p.items ?? []).filter(Boolean) ?? [];

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '16px' }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (items.length === 0) {
    return (
      <Stack alignItems="center" spacing={4} sx={{ py: 8 }}>
        <Box role="img" aria-label="movie">🎥</Box>
        <Typography variant="h5">لیست خالی است!</Typography>
        <Button variant="contained" onClick={() => navigate('/search')}>جستجو</Button>
      </Stack>
    );
  }

  return (
    <Grid container spacing={2}>
      {items.map((movie) => (
        movie && movie.id ? (
          <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
            <MovieCard
              movie={movie}
              onAdd={(m) => addMutation.mutate({ movie: m })}
              onRemove={(m) => removeMutation.mutate({ movie: m })}
            />
          </Grid>
        ) : null
      ))}
      {hasNextPage ? (
        <Grid item xs={12}>
          <Skeleton variant="rectangular" height={40} sx={{ borderRadius: '12px' }} />
        </Grid>
      ) : null}
    </Grid>
  );
};


