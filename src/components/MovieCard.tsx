import { Card, CardActionArea, CardContent, CardMedia, Chip, IconButton, Stack, Typography } from '@mui/material';
import { AddCircle, RemoveCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';
import type { Movie } from '../api/movies';

type MovieCardProps = {
  movie: Movie;
  onAdd?: (movie: Movie) => void;
  onRemove?: (movie: Movie) => void;
  showActions?: boolean;
  onClick?: (movie: Movie) => void;
};

export const MovieCard = ({ movie, onAdd, onRemove, showActions = true, onClick }: MovieCardProps) => {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card sx={{ borderRadius: '16px', overflow: 'hidden', height: 300, display: 'flex', flexDirection: 'column' }}>
        <CardActionArea onClick={() => onClick?.(movie)} sx={{ flexGrow: 1 }}>
          <CardMedia
            component="img"
            height="180"
            src={movie.posterUrl || '/vite.svg'}
            alt={movie.title}
            sx={{ position: 'relative', objectFit: 'cover', '&::after': { content: '""', position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: (theme) => (theme as any).palette?.gradients?.posterOverlay || 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' } }}
            loading="lazy"
          />
          <CardContent>
            <Stack spacing={1} alignItems="flex-start">
              <Typography variant="h6" noWrap title={movie.title}>{movie.title}</Typography>
              {movie.year ? <Chip label={movie.year} size="small" variant="outlined" /> : null}
            </Stack>
          </CardContent>
        </CardActionArea>
        {showActions ? (
          <Stack direction="row" justifyContent="space-between" alignItems="center" px={1} pb={1}>
            <IconButton color="primary" aria-label="add" onClick={() => onAdd?.(movie)}>
              <AddCircle />
            </IconButton>
            <IconButton color="error" aria-label="remove" onClick={() => onRemove?.(movie)}>
              <RemoveCircle />
            </IconButton>
          </Stack>
        ) : null}
      </Card>
    </motion.div>
  );
};


