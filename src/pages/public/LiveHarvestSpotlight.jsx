import { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Button, Paper, Chip, IconButton, Skeleton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdVerified,
  MdChevronLeft,
  MdChevronRight,
  MdArrowForward,
  MdAgriculture,
} from 'react-icons/md';
import { useLanguage } from '../../context/LanguageContext';
import { getFirstImage, getImageUrl, DEFAULT_FALLBACK_IMAGE } from '../../common/imageUtils';

const ROTATE_INTERVAL_MS = 4500; // 4.5 seconds

const LiveHarvestSpotlight = ({ products: incomingProducts = [], isLoading = false }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Strictly use backend database products only (NO hardcoded fallback)
  const products = useMemo(() => {
    return Array.isArray(incomingProducts) ? incomingProducts : [];
  }, [incomingProducts]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slideDirection, setSlideDirection] = useState(1); // 1 = right, -1 = left

  // Keep index within bounds if products array size changes
  useEffect(() => {
    if (currentIndex >= products.length) {
      setCurrentIndex(0);
    }
  }, [products.length, currentIndex]);

  // Automatic rotation every few seconds only when 2 or more products exist
  useEffect(() => {
    if (products.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setSlideDirection(1);
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, ROTATE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [products.length, isPaused]);

  const handlePrev = useCallback(
    (e) => {
      e?.stopPropagation?.();
      setSlideDirection(-1);
      setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
    },
    [products.length]
  );

  const handleNext = useCallback(
    (e) => {
      e?.stopPropagation?.();
      setSlideDirection(1);
      setCurrentIndex((prev) => (prev + 1) % products.length);
    },
    [products.length]
  );

  // 1. Loading State
  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 4,
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          minHeight: 440,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton variant="text" width={180} height={32} />
          <Skeleton variant="rounded" width={110} height={26} />
        </Box>
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3, mb: 2 }} />
        <Skeleton variant="text" width="70%" height={28} />
        <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={70} sx={{ borderRadius: 2.5, mb: 2 }} />
        <Skeleton variant="rounded" height={44} sx={{ borderRadius: 2.5 }} />
      </Paper>
    );
  }

  // 2. Empty State: No product found in database
  if (products.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
          minHeight: 440,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Top Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#94A3B8',
              }}
            />
            <Typography variant="subtitle1" fontWeight={700} color="#1E293B">
              🌾 {t('market.liveHarvestSpotlight', 'Live Harvest Spotlight')}
            </Typography>
          </Box>
          <Chip
            label={t('market.liveMandiStatus', 'Marketplace')}
            size="small"
            sx={{ fontWeight: 600, fontSize: '0.75rem', height: 26, bgcolor: '#F1F5F9', color: '#64748B' }}
          />
        </Box>

        {/* Empty Content Body */}
        <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: '#F8FAF9',
              border: '2px dashed #CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
              fontSize: 34,
            }}
          >
            🌾
          </Box>
          <Typography variant="h5" fontWeight={800} color="#0F172A" gutterBottom>
            {t('market.noProductFound', 'No product found')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto', lineHeight: 1.6, mb: 3 }}>
            {t(
              'market.noSpotlightDesc',
              'Currently there are no active crop listings available from farmers in the database.'
            )}
          </Typography>

          <Button
            component={Link}
            to="/register?role=seller"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            startIcon={<MdAgriculture size={22} />}
            sx={{
              py: 1.3,
              fontWeight: 700,
              borderRadius: 2.5,
              fontSize: '0.95rem',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              mb: 1.5,
            }}
          >
            {t('market.registerAsFarmer', 'Register as Farmer to List Crops')}
          </Button>

          <Button
            component={Link}
            to="/market"
            variant="outlined"
            fullWidth
            size="medium"
            sx={{
              py: 1,
              fontWeight: 600,
              borderRadius: 2.5,
              borderColor: '#E2E8F0',
              color: '#475569',
              '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAF9' },
            }}
          >
            {t('market.browseMandi', 'Browse Crop Mandi')}
          </Button>
        </Box>

        {/* Footer info */}
        <Box sx={{ pt: 2, borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {t('market.liveSync', 'Real-time database sync active')}
          </Typography>
        </Box>
      </Paper>
    );
  }

  // 3. Carousel with actual database products
  const current = products[currentIndex] || products[0];

  const cropBaseName = current.crop?.name ? current.crop.name.split(' (')[0].trim() : '';
  const title = current.variety?.toLowerCase().includes(cropBaseName.toLowerCase())
    ? current.variety
    : cropBaseName
    ? `${cropBaseName} - ${current.variety}`
    : current.variety || 'Live Harvest Lot';

  const farmerName =
    current.seller?.seller_profile?.full_name ||
    current.seller?.seller_profile?.farm_name ||
    'Verified Farmer';

  const locationText = `${current.pickup_district || 'Gujarat'}, ${current.pickup_state || 'Gujarat'}`;
  const moistureText = current.moisture_percentage ? `• Moisture ${current.moisture_percentage}%` : '';
  const priceFormatted = current.price_per_unit_paise
    ? `₹${Math.round(current.price_per_unit_paise / 100).toLocaleString('en-IN')}`
    : '₹0';
  const stockFormatted = `${Math.round(Number(current.available_quantity || current.total_quantity || 0))} ${current.unit || 'Quintals'}`;
  const imageUrl = getFirstImage(current, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=700&q=80');

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 350, damping: 30 },
        opacity: { duration: 0.35 },
      },
    },
    exit: (direction) => ({
      x: direction > 0 ? -30 : 30,
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 350, damping: 30 },
        opacity: { duration: 0.25 },
      },
    }),
  };

  return (
    <Paper
      elevation={0}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: 4,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: '0 30px 60px -15px rgba(37, 99, 235, 0.12)',
        },
      }}
    >
      {/* Top Header Row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#16A34A',
              boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.2)',
            }}
          />
          <Typography variant="subtitle1" fontWeight={700} color="#1E293B">
            🌾 {t('market.liveHarvestSpotlight', 'Live Harvest Spotlight')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          {current.is_organic && (
            <Chip
              label={t('market.organic', 'Organic')}
              size="small"
              sx={{
                bgcolor: '#DCFCE7',
                color: '#15803D',
                fontWeight: 700,
                fontSize: '0.72rem',
                height: 24,
              }}
            />
          )}
          <Chip
            icon={<MdVerified size={14} color="#16A34A" />}
            label={t('market.verifiedFarmer', 'Verified Farmer')}
            size="small"
            color="success"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: '0.75rem', height: 26 }}
          />
        </Box>
      </Box>

      {/* Main Animated Card Area */}
      <Box sx={{ position: 'relative', minHeight: 380 }}>
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key={current.id || currentIndex}
            custom={slideDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {/* Image Frame with Navigation Arrows & Live Progress Bar */}
            <Box
              sx={{
                position: 'relative',
                borderRadius: 3,
                overflow: 'hidden',
                mb: 2,
                bgcolor: '#F1F5F9',
                height: 200,
              }}
            >
              <Box
                component="img"
                src={imageUrl}
                alt={title}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.4s ease',
                  '&:hover': { transform: 'scale(1.03)' },
                }}
              />

              {/* Crop Category or Grade Pill */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  bgcolor: 'rgba(15, 23, 42, 0.8)',
                  backdropFilter: 'blur(6px)',
                  color: '#FFFFFF',
                  px: 1.2,
                  py: 0.4,
                  borderRadius: 1.5,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                }}
              >
                {current.grade || current.crop?.category || 'Grade A'}
              </Box>

              {/* Navigation Arrows */}
              {products.length > 1 && (
                <>
                  <IconButton
                    size="small"
                    onClick={handlePrev}
                    aria-label="Previous crop"
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(4px)',
                      color: '#0F172A',
                      width: 32,
                      height: 32,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      '&:hover': { bgcolor: '#FFFFFF', transform: 'translateY(-50%) scale(1.08)' },
                    }}
                  >
                    <MdChevronLeft size={20} />
                  </IconButton>

                  <IconButton
                    size="small"
                    onClick={handleNext}
                    aria-label="Next crop"
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(4px)',
                      color: '#0F172A',
                      width: 32,
                      height: 32,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      '&:hover': { bgcolor: '#FFFFFF', transform: 'translateY(-50%) scale(1.08)' },
                    }}
                  >
                    <MdChevronRight size={20} />
                  </IconButton>
                </>
              )}

              {/* Progress Line indicating next auto-slide */}
              {products.length > 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <motion.div
                    key={`progress-${currentIndex}-${isPaused}`}
                    initial={{ width: '0%' }}
                    animate={{ width: isPaused ? '0%' : '100%' }}
                    transition={{ duration: isPaused ? 0 : ROTATE_INTERVAL_MS / 1000, ease: 'linear' }}
                    style={{ height: '100%', backgroundColor: '#22C55E' }}
                  />
                </Box>
              )}
            </Box>

            {/* Title & Farmer Details */}
            <Typography
              variant="h6"
              fontWeight={800}
              color="#0F172A"
              sx={{
                lineHeight: 1.3,
                mb: 0.5,
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'color 0.2s',
                '&:hover': { color: '#2563EB' },
              }}
              onClick={() => navigate(`/market/${current.id}`)}
            >
              {title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              Farmer {farmerName} • {locationText} {moistureText}
            </Typography>

            {/* Price & Stock Box */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                bgcolor: '#F8FAF9',
                borderRadius: 2.5,
                border: '1px solid #E2E8F0',
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  {t('market.pricePerQuintal', 'Price Per Quintal')}
                </Typography>
                <Typography variant="h5" fontWeight={800} color="#2563EB">
                  {priceFormatted}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  {t('market.availableStock', 'Available Stock')}
                </Typography>
                <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
                  {stockFormatted}
                </Typography>
              </Box>
            </Box>

            {/* CTA Button */}
            <Button
              component={Link}
              to="/market"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{
                py: 1.25,
                fontWeight: 700,
                borderRadius: 2.5,
                fontSize: '0.95rem',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
              }}
              endIcon={<MdArrowForward size={18} />}
            >
              {t('market.viewAllLiveListings', 'View All Live Listings')}
            </Button>
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Footer Indicators & Direct Link */}
      {products.length > 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2,
            pt: 1.5,
            borderTop: '1px solid #F1F5F9',
          }}
        >
          {/* Pagination Dots */}
          <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
            {products.map((item, idx) => (
              <Box
                key={item.id || idx}
                onClick={() => {
                  setSlideDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                sx={{
                  width: idx === currentIndex ? 22 : 7,
                  height: 7,
                  borderRadius: 4,
                  bgcolor: idx === currentIndex ? '#2563EB' : '#CBD5E1',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': { bgcolor: idx === currentIndex ? '#1D4ED8' : '#94A3B8' },
                }}
              />
            ))}
          </Box>

          {/* Live Status Counter */}
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {currentIndex + 1} of {products.length} {t('market.liveLots', 'Live Lots')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default LiveHarvestSpotlight;
