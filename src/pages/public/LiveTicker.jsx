import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { MdTrendingUp } from 'react-icons/md';
import { useLanguage } from '../../context/LanguageContext';

const LiveTicker = ({ products = [], isLoading = false }) => {
  const { t } = useLanguage();

  // Duplicate items to ensure smooth infinite loop across all screen sizes
  const displayItems = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];
    if (products.length === 1) {
      return [...products, ...products, ...products, ...products];
    }
    if (products.length < 4) {
      return [...products, ...products, ...products];
    }
    return [...products, ...products];
  }, [products]);

  return (
    <Box
      sx={{
        bgcolor: '#1E293B',
        color: '#FFFFFF',
        py: { xs: 0.9, sm: 1.1 },
        px: { xs: 1.5, sm: 3 },
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        borderBottom: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Static Left Badge */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 0.6, sm: 1 },
          color: '#4ADE80',
          fontWeight: 700,
          fontSize: { xs: '0.72rem', sm: '0.82rem' },
          whiteSpace: 'nowrap',
          flexShrink: 0,
          pr: { xs: 1.2, sm: 2 },
          borderRight: '1px solid #334155',
          mr: { xs: 1.2, sm: 2 },
          zIndex: 2,
        }}
      >
        <MdTrendingUp size={16} />
        <span>{t('market.liveCropListings', 'LIVE LISTINGS:')}</span>
      </Box>

      {/* Scrolling Content Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
        }}
      >
        {isLoading ? (
          <Typography variant="caption" sx={{ color: '#94A3B8', fontStyle: 'italic', fontSize: { xs: '0.72rem', sm: '0.8rem' } }}>
            {t('market.syncingListings', 'Syncing live crop listings from database...')}
          </Typography>
        ) : displayItems.length === 0 ? (
          /* Empty State: No product found */
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
            <Typography
              variant="caption"
              sx={{
                color: '#94A3B8',
                fontSize: { xs: '0.72rem', sm: '0.8rem' },
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.6,
              }}
            >
              <span style={{ color: '#F87171', fontWeight: 700 }}>•</span>
              <strong>{t('market.noProductFound', 'No product found')}</strong>
              <span style={{ color: '#64748B' }}>— {t('market.noTickerDesc', 'Currently no live crops listed in the marketplace.')}</span>
            </Typography>
            <Typography
              component={Link}
              to="/register?role=seller"
              variant="caption"
              sx={{
                color: '#4ADE80',
                fontWeight: 700,
                textDecoration: 'underline',
                fontSize: { xs: '0.72rem', sm: '0.8rem' },
                '&:hover': { color: '#86EFAC' },
                display: { xs: 'none', sm: 'inline' },
              }}
            >
              {t('market.listCropsFarmer', 'Register as Farmer to list crops →')}
            </Typography>
          </Box>
        ) : (
          /* Continuous Auto-Scrolling Marquee */
          <Box
            sx={{
              display: 'flex',
              width: 'max-content',
              gap: { xs: 3, sm: 4.5 },
              animation: `tickerScroll ${Math.max(20, displayItems.length * 4)}s linear infinite`,
              willChange: 'transform',
              '&:hover': {
                animationPlayState: 'paused',
              },
              '@keyframes tickerScroll': {
                '0%': { transform: 'translateX(0%)' },
                '100%': { transform: 'translateX(-50%)' },
              },
            }}
          >
            {displayItems.map((item, index) => {
              const cropBase = item.crop?.name ? item.crop.name.split(' (')[0].trim() : '';
              const title = item.variety?.toLowerCase().includes(cropBase.toLowerCase())
                ? item.variety
                : cropBase
                ? `${cropBase} - ${item.variety}`
                : item.variety || 'Live Crop';

              const priceINR = item.price_per_unit_paise
                ? Math.round(item.price_per_unit_paise / 100).toLocaleString('en-IN')
                : '0';

              const location = item.pickup_district
                ? `${item.pickup_district}, ${item.pickup_state || 'Gujarat'}`
                : item.pickup_state || 'Gujarat';

              const qty = Math.round(Number(item.available_quantity || item.total_quantity || 0));

              return (
                <Box
                  key={`${item.id}-${index}`}
                  component={Link}
                  to={`/market/${item.id}`}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    textDecoration: 'none',
                    color: '#E2E8F0',
                    fontSize: { xs: '0.74rem', sm: '0.82rem' },
                    transition: 'color 0.2s',
                    '&:hover': {
                      color: '#FFFFFF',
                      '& .price-tag': { color: '#FEF08A' },
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      bgcolor: '#4ADE80',
                      flexShrink: 0,
                    }}
                  />
                  <span>
                    <strong>{title}</strong>
                    <span style={{ color: '#94A3B8', marginLeft: 4 }}>({location})</span>:
                  </span>
                  <span className="price-tag" style={{ color: '#FCD34D', fontWeight: 700 }}>
                    ₹{priceINR}/{item.unit || 'Qtl'}
                  </span>
                  <span style={{ color: '#64748B', fontSize: '0.72rem' }}>
                    ({qty} {item.unit || 'Qtl'})
                  </span>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default LiveTicker;
