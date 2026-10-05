import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MdLockOutline } from 'react-icons/md';

const NotAuthorized = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const errorMsg = searchParams.get('error') || 'You do not have permission to access this portal page.';

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 5,
          maxWidth: 480,
          textAlign: 'center',
          borderRadius: 4,
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
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
          <MdLockOutline />
        </Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Access Restricted
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          {errorMsg}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button variant="contained" color="primary" onClick={() => navigate('/')}>
            Return to Market
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NotAuthorized;
