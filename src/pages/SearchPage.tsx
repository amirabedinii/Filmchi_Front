import { useState, useEffect } from 'react';
import { Box, Button, Dialog, DialogContent, DialogTitle, Grid, IconButton, Stack, TextField, Typography } from '@mui/material';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchMovies, addMovieToList, type Movie } from '../api/movies';
import { MovieCard } from '../components/MovieCard';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const SearchPage = () => {
  const [open, setOpen] = useState(true);
  const [q, setQ] = useState('');
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const listName = params.get('list') || 'favorites';
  const queryClient = useQueryClient();

  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['search', q],
    queryFn: ({ pageParam }) => searchMovies(q, pageParam as string | undefined),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: q.trim().length > 0,
    initialPageParam: undefined,
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
    onMutate: async ({ movie }) => {
      toast.loading('Adding...', { id: movie.id });
    },
    onSuccess: (_data, { movie }) => {
      toast.success(`${movie.title} added`, { id: movie.id });
      queryClient.invalidateQueries({ queryKey: ['list', listName] });
    },
    onError: (_e, { movie }) => toast.error('Failed to add', { id: movie.id }),
  });

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <Dialog fullWidth maxWidth="lg" open={open} onClose={() => { setOpen(false); navigate(-1); }}>
      <DialogTitle>Search Movies</DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={2} mb={2}>
          <TextField fullWidth placeholder="Search by title..." value={q} onChange={(e) => setQ(e.target.value)} />
          <Button variant="contained" onClick={() => setParams({ list: listName, q })}>Search</Button>
        </Stack>
        {q.trim().length === 0 ? (
          <Typography variant="body2" color="text.secondary">Type to search...</Typography>
        ) : (
          <Grid container spacing={2}>
            {items.map((m) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={m.id}>
                <MovieCard movie={m} onAdd={(movie) => addMutation.mutate({ movie })} showActions onClick={(movie) => addMutation.mutate({ movie })} />
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
};


