import { Card, CardActionArea, CardContent, CardMedia, Chip, IconButton, Stack, Typography, Box } from '@mui/material';
import { AddCircle, RemoveCircle, Psychology } from '@mui/icons-material';
import { motion } from 'framer-motion';
import type { Movie, RecommendedMovie } from '../api/movies';

type MovieCardProps = {
  movie: Movie;
  onAdd?: (movie: Movie) => void;
  onRemove?: (movie: Movie) => void;
  showActions?: boolean;
  onClick?: (movie: Movie) => void;
  recommendation?: {
    reason: string;
    overview?: string;
  };
};

const cardVariants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  hover: { 
    scale: 1.02, 
    rotateX: 5,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 17 
    }
  },
  tap: { scale: 0.98 }
};

export const MovieCard = ({ movie, onAdd, onRemove, showActions = true, onClick, recommendation }: MovieCardProps) => {
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
    >
      <Card 
        sx={{ 
          height: recommendation ? 380 : 300, 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          '&:hover': {
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          }
        }}
      >
        <CardActionArea onClick={() => onClick?.(movie)} sx={{ flexGrow: 1, position: 'relative' }}>
          <Box sx={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden' }}>
            <CardMedia
              component="img"
              sx={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                transition: 'transform 0.3s ease'
              }}
              src={movie.posterUrl || '/vite.svg'}
              alt={movie.title}
              loading="lazy"
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: (theme) => 
                  theme.palette.gradients?.posterOverlay || 
                  'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                pointerEvents: 'none'
              }}
            />
          </Box>
          <CardContent sx={{ flexGrow: 1, p: 2 }}>
            <Stack spacing={1} alignItems="flex-start" height="100%">
              <Typography 
                variant="h6" 
                noWrap 
                title={movie.title}
                sx={{ 
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  lineHeight: 1.3
                }}
              >
                {movie.title}
              </Typography>
              {movie.year && (
                <Chip 
                  label={movie.year} 
                  size="small" 
                  variant="outlined"
                  sx={{
                    fontSize: '0.75rem',
                    height: '24px',
                    borderRadius: '12px'
                  }}
                />
              )}
              {recommendation && (
                <Box sx={{ mt: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Psychology sx={{ fontSize: '1rem', color: 'primary.main' }} />
                    <Typography variant="caption" color="primary.main" fontWeight={600}>
                      Why this movie?
                    </Typography>
                  </Stack>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: '0.85rem',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {recommendation.reason}
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </CardActionArea>
        {showActions && (
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="center" 
            sx={{ px: 2, pb: 2 }}
          >
            <IconButton 
              color="secondary" 
              aria-label="add to list"
              onClick={(e) => {
                e.stopPropagation();
                onAdd?.(movie);
              }}
              sx={{
                '&:hover': {
                  transform: 'scale(1.1)',
                  backgroundColor: 'secondary.light'
                }
              }}
            >
              <AddCircle />
            </IconButton>
            <IconButton 
              color="error" 
              aria-label="remove from list"
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.(movie);
              }}
              sx={{
                '&:hover': {
                  transform: 'scale(1.1)',
                  backgroundColor: 'error.light'
                }
              }}
            >
              <RemoveCircle />
            </IconButton>
          </Stack>
        )}
      </Card>
    </motion.div>
  );
};


