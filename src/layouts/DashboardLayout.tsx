import { 
  Box, 
  Drawer, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Avatar, 
  Menu, 
  MenuItem, 
  Select, 
  Container,
  TextField,
  InputAdornment,
  useMediaQuery,
  Divider,
  Chip
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Brightness4, 
  Brightness7, 
  Search as SearchIcon,
  Favorite,
  Bookmark,
  WatchLater,
  PlaylistPlay
} from '@mui/icons-material';
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../theme/ThemeProvider.tsx';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

const drawerWidth = 240;
const miniDrawerWidth = 80;

const menuItems = [
  { key: 'watchlist', icon: WatchLater, path: '/lists/watchlist', labelKey: 'watchlist' },
  { key: 'favorites', icon: Favorite, path: '/lists/favorites', labelKey: 'favorites' },
  { key: 'bookmarks', icon: Bookmark, path: '/lists/bookmarks', labelKey: 'bookmarks' },
  { key: 'playlists', icon: PlaylistPlay, path: '/lists/playlists', labelKey: 'playlists' },
];

export const DashboardLayout = () => {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerHovered, setIsDrawerHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isRtl = theme.direction === 'rtl';
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);
  const isDrawerExpanded = isMobile ? isDrawerOpen : isDrawerOpen || isDrawerHovered;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }} dir={isRtl ? 'rtl' : 'ltr'}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: `calc(100% - ${isMobile ? 0 : isDrawerExpanded ? drawerWidth : miniDrawerWidth}px)`,
          ml: isMobile ? 0 : isDrawerExpanded ? `${drawerWidth}px` : `${miniDrawerWidth}px`,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && (
              <IconButton 
                edge="start" 
                color="inherit" 
                aria-label="menu" 
                onClick={toggleDrawer}
                sx={{
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography 
                variant="h5" 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #5A67D8, #818CF8)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.025em'
                }}
              >
                🎬 Filmchi
              </Typography>
            </motion.div>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search movies..."
              onClick={() => navigate('/search')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                readOnly: true,
              }}
              sx={{
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                  backgroundColor: 'background.paper',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'grey.50',
                  }
                }
              }}
            />
            
            <IconButton 
              color="inherit" 
              onClick={() => useThemeStore.getState().toggleTheme()}
              sx={{
                '&:hover': {
                  backgroundColor: 'primary.light',
                  transform: 'scale(1.1)'
                }
              }}
            >
              {useThemeStore.getState().mode === 'light' ? <Brightness4 /> : <Brightness7 />}
            </IconButton>
            
            <Select 
              value={i18n.language} 
              onChange={(e) => i18n.changeLanguage(e.target.value)} 
              size="small"
              sx={{ 
                minWidth: 80,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            >
              <MenuItem value="en">🇺🇸 EN</MenuItem>
              <MenuItem value="fa">🇮🇷 FA</MenuItem>
            </Select>
            
            <IconButton 
              onClick={handleMenu} 
              color="inherit"
              sx={{
                '&:hover': {
                  transform: 'scale(1.1)'
                }
              }}
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                🎭
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  borderRadius: '12px',
                  mt: 1,
                  minWidth: 180
                }
              }}
            >
              <MenuItem onClick={handleClose}>
                <Typography variant="body2">{t('profile')}</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleClose}>
                <Typography variant="body2" color="error">{t('logout')}</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? isDrawerOpen : true}
        onClose={toggleDrawer}
        onMouseEnter={() => !isMobile && setIsDrawerHovered(true)}
        onMouseLeave={() => !isMobile && setIsDrawerHovered(false)}
        sx={{
          width: isDrawerExpanded ? drawerWidth : miniDrawerWidth,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          [`& .MuiDrawer-paper`]: {
            width: isDrawerExpanded ? drawerWidth : miniDrawerWidth,
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            backgroundColor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Toolbar />
        
        <Box sx={{ overflow: 'auto', py: 2 }}>
          <List sx={{ px: 1 }}>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <motion.div
                  key={item.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ListItemButton
                    onClick={() => {
                      navigate(item.path);
                      if (isMobile) setIsDrawerOpen(false);
                    }}
                    sx={{
                      minHeight: 48,
                      borderRadius: '12px',
                      mb: 1,
                      px: 2.5,
                      backgroundColor: isActive ? 'primary.main' : 'transparent',
                      color: isActive ? 'primary.contrastText' : 'text.primary',
                      '&:hover': {
                        backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                        transform: 'translateX(4px)',
                      },
                      transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: isDrawerExpanded ? 3 : 'auto',
                        justifyContent: 'center',
                        color: isActive ? 'primary.contrastText' : 'primary.main',
                      }}
                    >
                      <IconComponent />
                    </ListItemIcon>
                    
                    {isDrawerExpanded && (
                      <ListItemText 
                        primary={t(item.labelKey)} 
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontWeight: isActive ? 600 : 400,
                            fontSize: '0.95rem'
                          }
                        }}
                      />
                    )}
                    
                    {isDrawerExpanded && isActive && (
                      <Chip
                        size="small"
                        label="Active"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'inherit'
                        }}
                      />
                    )}
                  </ListItemButton>
                </motion.div>
              );
            })}
          </List>
          
          <Divider sx={{ my: 2, mx: 2 }} />
          
          <Box sx={{ px: 2, py: 1 }}>
            {isDrawerExpanded && (
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Your Lists
              </Typography>
            )}
          </Box>
        </Box>
      </Drawer>
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: 3, minHeight: 'calc(100vh - 64px)' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};


