import { Chip } from '@mui/material';

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

const resolveVariant = (status) => {
  if (!status) return 'neutral';
  const s = String(status).toLowerCase();

  if (['active', 'approved', 'completed', 'verified', 'live', 'paid', 'success'].includes(s)) {
    return 'success';
  }
  if (['pending', 'in_progress', 'draft', 'escrow_held', 'change_requested', 'warning'].includes(s)) {
    return 'warning';
  }
  if (['rejected', 'suspended', 'cancelled', 'delete', 'not assigned', 'not_assigned', 'error', 'failed'].includes(s)) {
    return 'error';
  }
  if (['in_transit', 'shipped', 'dispatched', 'assigned', 'info'].includes(s)) {
    return 'info';
  }
  return 'neutral';
};

/**
 * Reusable StatusBadge pill component matching reference screenshots
 * E.g. "Not Assigned" (red pill), "Completed" (green pill), "SYSTEM" (green pill)
 */
const StatusBadge = ({ label, status, variant, icon, size = 'small', sx = {} }) => {
  const effectiveVariant = variant || resolveVariant(status || label);
  const config = statusVariants[effectiveVariant] || statusVariants.neutral;

  return (
    <Chip
      icon={icon}
      label={label || status}
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
