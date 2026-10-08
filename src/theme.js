import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Rich Leaf Green
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#E65100', // Harvest Warm Gold / Amber
      light: '#FF9800',
      dark: '#B23C00',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#2E7D32',
      light: '#E8F5E9',
    },
    warning: {
      main: '#ED6C02',
      light: '#FFF4E5',
    },
    error: {
      main: '#D32F2F',
      light: '#FFEBEE',
    },
    info: {
      main: '#0288D1',
      light: '#E1F5FE',
    },
    background: {
      default: '#F8FAF9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
      disabled: '#94A3B8',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          padding: '10px 22px',
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 14px rgba(46, 125, 50, 0.25)',
            transform: 'translateY(-1px)',
          },
        },
        containedSecondary: {
          '&:hover': {
            boxShadow: '0 4px 14px rgba(230, 81, 0, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 16px rgba(0, 0, 0, 0.02)',
          border: '1px solid #E2E8F0',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 6px',
          padding: '8px 14px',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: '#1E293B',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            backgroundColor: '#EFF6FF',
            color: '#1D4ED8',
          },
          '&.Mui-selected': {
            backgroundColor: '#2563EB !important',
            color: '#FFFFFF !important',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#1D4ED8 !important',
              color: '#FFFFFF !important',
            },
            '&.Mui-focusVisible': {
              backgroundColor: '#1D4ED8 !important',
            },
            '& .MuiTypography-root': {
              color: '#FFFFFF !important',
            },
            '& svg': {
              color: '#FFFFFF !important',
            },
          },
          '&.Mui-disabled, &.Mui-disabled.Mui-selected': {
            opacity: 0.65,
            color: '#94A3B8 !important',
            backgroundColor: 'transparent !important',
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          marginTop: 4,
          boxShadow: '0 10px 35px -5px rgba(15, 23, 42, 0.14), 0 4px 12px -2px rgba(15, 23, 42, 0.08)',
          border: '1px solid #E2E8F0',
          maxHeight: 320,
        },
        list: {
          padding: '6px',
        },
      },
    },
  },
});

export default theme;
