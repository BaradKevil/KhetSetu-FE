import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563EB', // Vivid Blue from reference design
      light: '#3B82F6',
      dark: '#1D4ED8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0F172A', // Slate 900
      light: '#334155',
      dark: '#020617',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#16A34A',
      light: '#DCFCE7',
      dark: '#15803D',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#D97706',
      light: '#FEF3C7',
      dark: '#B45309',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#EF4444',
      light: '#FEE2E2',
      dark: '#DC2626',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#2563EB',
      light: '#EFF6FF',
      dark: '#1D4ED8',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
      disabled: '#94A3B8',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.025em',
      color: '#0F172A',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#0F172A',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#0F172A',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.015em',
      color: '#0F172A',
    },
    h5: {
      fontWeight: 700,
      color: '#0F172A',
    },
    h6: {
      fontWeight: 600,
      color: '#0F172A',
    },
    subtitle1: {
      fontWeight: 600,
      color: '#0F172A',
    },
    subtitle2: {
      fontWeight: 600,
      color: '#334155',
    },
    body1: {
      color: '#334155',
    },
    body2: {
      color: '#64748B',
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
          borderRadius: 8,
          padding: '8px 18px',
          boxShadow: 'none',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.15)',
          },
        },
        containedPrimary: {
          backgroundColor: '#2563EB',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#1D4ED8',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
          },
        },
        outlined: {
          borderColor: '#E2E8F0',
          color: '#334155',
          '&:hover': {
            backgroundColor: '#F8FAFC',
            borderColor: '#CBD5E1',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: 'none',
          border: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: 'none',
        },
        elevation0: {
          boxShadow: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#F1F5F9',
          padding: '14px 18px',
          color: '#334155',
        },
        head: {
          fontWeight: 700,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#64748B',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#F8FAFC',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
            '& fieldset': {
              borderColor: '#E2E8F0',
            },
            '&:hover fieldset': {
              borderColor: '#CBD5E1',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2563EB',
              borderWidth: '1.5px',
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          '& fieldset': {
            borderColor: '#E2E8F0',
          },
          '&:hover fieldset': {
            borderColor: '#CBD5E1',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#2563EB',
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          margin: '2px 6px',
          padding: '8px 12px',
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
          borderRadius: 10,
          marginTop: 4,
          boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.1)',
          border: '1px solid #E2E8F0',
          maxHeight: 320,
        },
        list: {
          padding: '4px',
        },
      },
    },
  },
});

export default theme;
