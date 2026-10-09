import { Paper, Box, Typography } from '@mui/material';

const colorMap = {
  blue: {
    bg: '#EFF6FF',
    iconColor: '#2563EB',
    borderColor: '#DBEAFE',
  },
  purple: {
    bg: '#F5F3FF',
    iconColor: '#7C3AED',
    borderColor: '#EDE9FE',
  },
  cyan: {
    bg: '#ECFEFF',
    iconColor: '#0891B2',
    borderColor: '#CFFAFE',
  },
  green: {
    bg: '#F0FDF4',
    iconColor: '#16A34A',
    borderColor: '#DCFCE7',
  },
  amber: {
    bg: '#FEFCE8',
    iconColor: '#D97706',
    borderColor: '#FEF08A',
  },
  red: {
    bg: '#FEF2F2',
    iconColor: '#EF4444',
    borderColor: '#FECACA',
  },
  slate: {
    bg: '#F8FAFC',
    iconColor: '#475569',
    borderColor: '#E2E8F0',
  },
};

/**
 * Reusable KPICard component exactly matching the reference screenshots
 * Left: tinted icon square (blue/purple/cyan/green/amber)
 * Right: label on top, big bold value on bottom, optional subtitle
 */
const KPICard = ({
  icon,
  label,
  title,
  value,
  subtitle,
  color = 'blue',
  onClick,
  sx = {},
}) => {
  const scheme = colorMap[color] || colorMap.blue;
  const isClickable = Boolean(onClick);
  const displayLabel = label || title;

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'function') {
      const IconComp = icon;
      return <IconComp size={22} />;
    }
    return icon;
  };

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.5,
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderRadius: 3.5,
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        '&:hover': isClickable
          ? {
              borderColor: '#CBD5E1',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
              transform: 'translateY(-1px)',
            }
          : {},
        ...sx,
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2.5,
            bgcolor: scheme.bg,
            color: scheme.iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          {renderIcon()}
        </Box>
      )}

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: '#64748B',
            fontWeight: 600,
            fontSize: '0.78rem',
            display: 'block',
            lineHeight: 1.2,
            mb: 0.5,
            textTransform: 'none',
          }}
          noWrap
        >
          {displayLabel}
        </Typography>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          {value}
        </Typography>

        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: '#94A3B8',
              fontSize: '0.72rem',
              display: 'block',
              mt: 0.4,
            }}
            noWrap
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default KPICard;
