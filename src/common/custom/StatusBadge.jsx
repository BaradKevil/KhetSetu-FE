import { Chip } from '@mui/material';
import { useLanguage } from '../../context/LanguageContext';
import { getStatusLabel, getStatusVariant } from '../status';

const statusVariants = {
  success: {
    bg: '#DCFCE7',
    color: '#166534',
    border: '1px solid #BBF7D0',
  },
  warning: {
    bg: '#FEF3C7',
    color: '#92400E',
    border: '1px solid #FDE68A',
  },
  amber: {
    bg: '#FEF3C7',
    color: '#B45309',
    border: '1px solid #FCD34D',
  },
  error: {
    bg: '#FEE2E2',
    color: '#991B1B',
    border: '1px solid #FECACA',
  },
  info: {
    bg: '#EFF6FF',
    color: '#1D4ED8',
    border: '1px solid #BFDBFE',
  },
  purple: {
    bg: '#F5F3FF',
    color: '#5B21B6',
    border: '1px solid #DDD6FE',
  },
  neutral: {
    bg: '#F1F5F9',
    color: '#475569',
    border: '1px solid #E2E8F0',
  },
};

/**
 * Reusable StatusBadge pill component with canonical status dictionary mapping.
 * Automatically translates raw statuses (escrow_held, sold_out, etc.) to role-aware labels.
 */
const StatusBadge = ({ label, status, role, variant, icon, size = 'small', sx = {} }) => {
  const { language } = useLanguage() || { language: 'en' };
  const userRole = role || localStorage.getItem('role') || 'farmer';

  const statusCode = status || label;
  const canonicalLabel = label || getStatusLabel(statusCode, userRole, language);
  const effectiveVariant = variant || getStatusVariant(statusCode);
  const config = statusVariants[effectiveVariant] || statusVariants.neutral;

  return (
    <Chip
      icon={icon}
      label={canonicalLabel || statusCode}
      size={size}
      sx={{
        bgcolor: config.bg,
        color: config.color,
        border: config.border,
        fontWeight: 700,
        fontSize: '0.72rem',
        borderRadius: 2,
        height: 24,
        px: 0.5,
        ...sx,
      }}
    />
  );
};

export default StatusBadge;
