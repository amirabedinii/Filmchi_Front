import { createTheme } from '@mui/material/styles';

// Extend MUI theme interface to include custom properties
declare module '@mui/material/styles' {
  interface Palette {
    gradients: {
      posterOverlay: string;
    };
  }
  interface PaletteOptions {
    gradients?: {
      posterOverlay: string;
    };
  }
}

// Light Mode Palette
const lightPalette = {
  mode: 'light' as 'light',
  primary: {
    main: '#5A67D8',
    light: '#818CF8',
    dark: '#4C51BF',
  },
  secondary: {
    main: '#48BB78',
    light: '#9AE6B4',
    dark: '#38A169',
  },
  background: {
    default: '#F7FAFC',
    paper: '#FFFFFF',
  },
  surface: {
    default: '#FFFFFF',
    hover: 'rgba(255,255,255,0.8)',
  },
  text: {
    primary: '#2D3748',
    secondary: '#718096',
    disabled: '#A0AEC0',
  },
  error: {
    main: '#E53E3E',
  },
};

// Dark Mode Palette
const darkPalette = {
  mode: 'dark' as 'dark',
  primary: {
    main: '#818CF8',
    light: '#A5B4FC',
    dark: '#6366F1',
  },
  secondary: {
    main: '#68D391',
    light: '#C6F6D5',
    dark: '#48BB78',
  },
  background: {
    default: '#1A202C',
    paper: '#2D3748',
  },
  surface: {
    default: '#2D3748',
    hover: 'rgba(45,55,72,0.9)',
  },
  text: {
    primary: '#E2E8F0',
    secondary: '#A0AEC0',
    disabled: '#4A5568',
  },
  error: {
    main: '#FC8181',
  },
};

// Gradients
const gradients = {
  posterOverlay: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
};

// Typography
const typography = {
  fontFamily: [
    'Vazirmatn', // Persian
    'Roboto', // English
    '-apple-system',
    'BlinkMacSystemFont',
    'sans-serif',
  ].join(','),
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.025em',
  },
  h6: {
    fontSize: '1.25rem',
    fontWeight: 600,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5,
  },
};

// Component Overrides
const components = {
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
        textTransform: 'none' as const,
        fontWeight: 600,
        boxShadow: '0 4px 14px rgba(90,103,216,0.4)',
        '&:hover': {
          transform: 'translateY(-1px)',
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
          backgroundColor: 'surface.default',
          '&:focus': {
            borderColor: 'primary.main',
            boxShadow: '0 0 0 3px rgba(90,103,216,0.1)',
          },
        },
      },
    },
  },
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        background: 'linear-gradient(135deg, background.default, background.paper)',
      },
    },
  },
};

export const lightTheme = createTheme({
  palette: {
    ...lightPalette,
    gradients,
  },
  typography,
  components,
  spacing: 8, // 8px base unit
});

export const darkTheme = createTheme({
  palette: {
    ...darkPalette,
    gradients,
  },
  typography,
  components,
  spacing: 8, // 8px base unit
});
