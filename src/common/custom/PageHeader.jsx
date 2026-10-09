import { Box, Typography, IconButton } from '@mui/material';
import { MdArrowBack } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable PageHeader component matching reference design
 * Supports standard layout (title + subtitle + right actions)
 * and banner layout (Screenshot 5 vibrant blue card)
 */
const PageHeader = ({
  title,
  subtitle,
  actions,
  showBackButton = false,
  onBack,
  banner = false,
  sx = {},
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  if (banner) {
    return (
      <Box
        sx={{
          bgcolor: '#2563EB',
          color: '#FFFFFF',
          borderRadius: 3.5,
          p: { xs: 2.5, sm: 3.5 },
          mb: 3.5,
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          ...sx,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {showBackButton && (
            <IconButton
              onClick={handleBack}
              size="small"
              sx={{
                color: '#FFFFFF',
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' },
              }}
            >
              <MdArrowBack size={20} />
            </IconButton>
          )}
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)', mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        {actions && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>{actions}</Box>}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        mb: 3.5,
        gap: 2,
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {showBackButton && (
          <IconButton
            onClick={handleBack}
            size="small"
            sx={{
              color: '#475569',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
            }}
          >
            <MdArrowBack size={20} />
          </IconButton>
        )}
        <Box>
          <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ letterSpacing: '-0.02em' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {actions && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', alignSelf: { xs: 'stretch', sm: 'auto' } }}>
          {actions}
        </Box>
      )}
    </Box>
  );
};

export default PageHeader;
