import { Box, Typography, Button, Paper } from '@mui/material';
import { useRouteError, useNavigate } from 'react-router-dom';
import { MdErrorOutline, MdRefresh, MdHome } from 'react-icons/md';

const RouteErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const errorMessage =
    error?.statusText ||
    error?.message ||
    (typeof error === 'string' ? error : 'An unexpected application error occurred.');

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        bgcolor: '#F8FAFC',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5 },
          maxWidth: 520,
          textAlign: 'center',
          borderRadius: 4,
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
          bgcolor: '#FFFFFF',
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: '#FEE2E2',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            mx: 'auto',
            mb: 3,
          }}
        >
          <MdErrorOutline />
        </Box>
        <Typography variant="h5" fontWeight={800} color="#0F172A" gutterBottom>
          Something Went Wrong
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5, lineHeight: 1.6 }}>
          {errorMessage}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<MdRefresh />}
            onClick={() => window.location.reload()}
            sx={{ borderRadius: 2.5, fontWeight: 700 }}
          >
            Reload Page
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<MdHome />}
            onClick={() => navigate('/')}
            sx={{ borderRadius: 2.5, fontWeight: 700 }}
          >
            Return to Market
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default RouteErrorBoundary;
