import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, IconButton, Typography, Avatar, Menu, MenuItem, Select } from '@mui/material';
import { Movie, CheckCircle, Menu as MenuIcon, Brightness4, Brightness7 } from '@mui/icons-material';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../theme/ThemeProvider.tsx';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 240;

export const DashboardLayout = () => {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isRtl = theme.direction === 'rtl';
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  return (
    <Box sx={{ display: 'flex' }} dir={isRtl ? 'rtl' : 'ltr'}>
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100%)`,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Filmchi
          </Typography>
          <IconButton color="inherit" onClick={() => useThemeStore.getState().toggleTheme()}>
            {useThemeStore.getState().mode === 'light' ? <Brightness4 /> : <Brightness7 />}
          </IconButton>
          <Select value={i18n.language} onChange={(e) => i18n.changeLanguage(e.target.value)} sx={{ mx: 1 }}>
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="fa">فارسی</MenuItem>
          </Select>
          <div>
            <IconButton onClick={handleMenu} color="inherit">
              <Avatar />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>{t('profile')}</MenuItem>
              <MenuItem onClick={handleClose}>{t('logout')}</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={isDrawerOpen}
        onClose={toggleDrawer}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItemButton>
              <ListItemIcon><Movie /></ListItemIcon>
              <ListItemText primary={t('movies')} />
            </ListItemButton>
            <ListItemButton>
              <ListItemIcon><CheckCircle /></ListItemIcon>
              <ListItemText primary={t('lists')} />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};


