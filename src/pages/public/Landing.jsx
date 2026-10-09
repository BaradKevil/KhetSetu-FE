import { useEffect, useRef } from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, CardMedia, Chip, Paper } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import {
  MdAgriculture,
  MdSecurity,
  MdAccountBalance,
  MdVerified,
  MdArrowForward,
  MdTrendingUp,
  MdCheckCircle,
} from 'react-icons/md';
import { useGetPublicMarketQuery, useGetMandiPricesQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import Navbar from '../../common/Navbar';
import LiveHarvestSpotlight from './LiveHarvestSpotlight';
import LiveTicker from './LiveTicker';
import { getFirstImage, DEFAULT_FALLBACK_IMAGE } from '../../common/imageUtils';

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const heroRef = useRef(null);
  const headlineRef = useRef(null);
  const subtitleRef = useRef(null);

  const { data: marketData, isLoading: isMarketLoading } = useGetPublicMarketQuery({ limit: 12 });
  const { data: mandiPrices } = useGetMandiPricesQuery();

  useEffect(() => {
    // GSAP Stagger Entrance for Hero Elements
    const ctx = gsap.context(() => {
      gsap.from(headlineRef.current, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });
      gsap.from(subtitleRef.current, {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.2,
        ease: 'power3.out',
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const allProducts = marketData?.items || [];
  const featuredCrops = allProducts.slice(0, 4);
  const rates = Array.isArray(mandiPrices) ? mandiPrices : [];

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Live Products Auto-Scrolling Ticker */}
      <LiveTicker products={allProducts} isLoading={isMarketLoading} />

      {/* Hero Section */}
      <Box
        ref={heroRef}
        sx={{
          py: { xs: 8, md: 12 },
          background: 'radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.07) 0%, transparent 40%), radial-gradient(circle at 90% 70%, rgba(8, 145, 178, 0.05) 0%, transparent 40%), #F8FAFC',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7} size={{ xs: 12, md: 7 }}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                <Chip
                  icon={<MdSecurity style={{ color: '#2563EB' }} />}
                  label={t('market.protectedEscrowMarketplace', '100% Protected Escrow Marketplace')}
                  sx={{ bgcolor: '#EFF6FF', color: '#1E40AF', fontWeight: 700, mb: 3, px: 1, py: 0.5, border: '1px solid #BFDBFE' }}
                />
              </motion.div>

              <Typography
                ref={headlineRef}
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 800,
                  color: '#0F172A',
                  fontSize: { xs: '2.5rem', sm: '3.2rem', md: '3.8rem' },
                  lineHeight: 1.15,
                  mb: 2.5,
                }}
              >
                {t('market.heroTitlePre', 'The Trusted Bridge From the')}{' '}
                <span style={{ color: '#2563EB' }}>{t('market.heroField', 'Field')}</span>{' '}
                {t('market.heroMid', 'to the')}{' '}
                <span style={{ color: '#0F172A' }}>{t('market.heroBuyer', 'Buyer')}</span>.
              </Typography>

              <Typography
                ref={subtitleRef}
                variant="h6"
                sx={{
                  color: '#475569',
                  fontWeight: 400,
                  fontSize: { xs: '1.05rem', md: '1.25rem' },
                  lineHeight: 1.6,
                  mb: 4.5,
                  maxWidth: 600,
                }}
              >
                {t('market.heroSubtitle', 'Farmers list crops directly at genuine prices. Buyers purchase with verified quality. Payments are held safely in escrow until verified delivery.')}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  component={Link}
                  to="/register?role=seller"
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ px: 3.5, py: 1.6, fontSize: '1rem', fontWeight: 700, borderRadius: 3 }}
                  startIcon={<MdAgriculture size={22} />}
                >
                  {t('market.registerAsFarmer', 'Register as Farmer')}
                </Button>
                <Button
                  component={Link}
                  to="/market"
                  variant="outlined"
                  size="large"
                  sx={{
                    px: 3.5,
                    py: 1.6,
                    fontSize: '1rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    borderColor: '#CBD5E1',
                    color: '#1E293B',
                    '&:hover': { borderColor: '#94A3B8', bgcolor: '#F1F5F9' },
                  }}
                  endIcon={<MdArrowForward size={20} />}
                >
                  {t('market.browseCropsRates', 'Browse Crops & Rates')}
                </Button>
              </Box>

              {/* Trust Badges */}
              <Box sx={{ display: 'flex', gap: 4, mt: 5, pt: 4, borderTop: '1px solid #E2E8F0', flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MdCheckCircle color="#2563EB" size={20} />
                  <Typography variant="body2" fontWeight={600} color="#334155">
                    {t('market.directBankPayouts', 'Direct Bank Payouts')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MdCheckCircle color="#2563EB" size={20} />
                  <Typography variant="body2" fontWeight={600} color="#334155">
                    {t('market.verifiedApmcRates', 'Verified APMC Mandi Rates')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MdCheckCircle color="#2563EB" size={20} />
                  <Typography variant="body2" fontWeight={600} color="#334155">
                    {t('market.zeroHiddenDeductions', 'Zero Hidden Deductions')}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Visual Hero Card - Rotating Live Harvest Spotlight */}
            <Grid item xs={12} md={5} size={{ xs: 12, md: 5 }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <LiveHarvestSpotlight products={allProducts} isLoading={isMarketLoading} />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How it works in 3 Steps */}
      <Box sx={{ py: 10, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" color="primary" fontWeight={700} letterSpacing="0.1em">
              SIMPLE & TRANSPARENT
            </Typography>
            <Typography variant="h3" fontWeight={800} color="#0F172A" sx={{ mt: 1 }}>
              How KhetSetu Protects Farmers & Buyers
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4} size={{ xs: 12, md: 4 }}>
              <Paper elevation={0} sx={{ p: 4, height: '100%', borderRadius: 3.5, bgcolor: '#F8FAF9', border: '1px solid #E2E8F0' }}>
                <Box sx={{ width: 52, height: 52, borderRadius: 2.5, bgcolor: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, mb: 2.5 }}>
                  <MdAgriculture />
                </Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  1. Farmer Lists Crop
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                  Farmers specify their harvest, variety, moisture level, location, and desired price. Listings are vetted against mandi benchmarks.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4} size={{ xs: 12, md: 4 }}>
              <Paper elevation={0} sx={{ p: 4, height: '100%', borderRadius: 3.5, bgcolor: '#F8FAF9', border: '1px solid #E2E8F0' }}>
                <Box sx={{ width: 52, height: 52, borderRadius: 2.5, bgcolor: '#FFF4E5', color: '#E65100', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, mb: 2.5 }}>
                  <MdSecurity />
                </Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  2. Escrow Payment Hold
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                  Buyers pay securely into the platform escrow. Funds are locked so farmers dispatch knowing money is 100% guaranteed.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4} size={{ xs: 12, md: 4 }}>
              <Paper elevation={0} sx={{ p: 4, height: '100%', borderRadius: 3.5, bgcolor: '#F8FAF9', border: '1px solid #E2E8F0' }}>
                <Box sx={{ width: 52, height: 52, borderRadius: 2.5, bgcolor: '#E0F2FE', color: '#0288D1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, mb: 2.5 }}>
                  <MdAccountBalance />
                </Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  3. Direct Bank Release
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                  Upon delivery confirmation, the platform automatically releases net earnings directly to the farmer's bank account with zero delay.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Crops Marketplace Section */}
      <Box sx={{ py: 10, bgcolor: '#F8FAF9' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 5, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="overline" color="primary" fontWeight={700} letterSpacing="0.1em">
                ACTIVE HARVESTS
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#0F172A">
                Fresh Listings Direct From Verified Farms
              </Typography>
            </Box>
            <Button component={Link} to="/market" variant="outlined" color="primary" endIcon={<MdArrowForward />}>
              Explore All Listings
            </Button>
          </Box>

          {featuredCrops.length === 0 ? (
            <Paper
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 3.5,
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF',
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: '#F8FAF9',
                  border: '2px dashed #CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  fontSize: 30,
                }}
              >
                🌾
              </Box>
              <Typography variant="h5" fontWeight={800} color="#0F172A" gutterBottom>
                {t('market.noProductFound', 'No product found')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 450, mx: 'auto', lineHeight: 1.6 }}>
                {t(
                  'market.noFeaturedCropsDesc',
                  'There are currently no active crop lots listed by farmers in the marketplace.'
                )}
              </Typography>
              <Button
                component={Link}
                to="/register?role=seller"
                variant="contained"
                color="primary"
                sx={{ px: 3, py: 1.2, fontWeight: 700, borderRadius: 2 }}
              >
                {t('market.registerAsFarmer', 'Register as Farmer to List Crops')}
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {featuredCrops.map((crop) => (
                <Grid item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }} key={crop.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={getFirstImage(crop)}
                      alt={crop.variety}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = crop.crop?.image_url || DEFAULT_FALLBACK_IMAGE;
                      }}
                    />
                    <CardContent sx={{ flex: 1, p: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {crop.crop?.name || 'Crop'}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ mt: 0.5, mb: 1 }}>
                        {crop.variety}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        📍 {crop.pickup_district}, {crop.pickup_state}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1.5, borderTop: '1px solid #F1F5F9' }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Rate
                          </Typography>
                          <Typography variant="subtitle1" fontWeight={800} color="#2E7D32">
                            ₹{(crop.price_per_unit_paise / 100).toFixed(0)}/{crop.unit}
                          </Typography>
                        </Box>
                        <Button
                          component={Link}
                          to={`/market/${crop.id}`}
                          variant="contained"
                          size="small"
                          color="primary"
                          sx={{ borderRadius: 2 }}
                        >
                          View
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 'auto', bgcolor: '#0F172A', color: '#94A3B8', py: 6, borderTop: '1px solid #1E293B' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="space-between">
            <Grid item xs={12} md={4} size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" fontWeight={800} color="#FFFFFF" sx={{ mb: 1 }}>
                🌾 Khet<span style={{ color: '#4ADE80' }}>Setu</span>
              </Typography>
              <Typography variant="body2" lineHeight={1.6}>
                Empowering Indian agriculture through equitable market access, transparent APMC pricing, and secure escrow settlement.
              </Typography>
            </Grid>
            <Grid item xs={6} md={2} size={{ xs: 6, md: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} color="#FFFFFF" sx={{ mb: 1.5 }}>
                Platform
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link to="/market" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.85rem' }}>Browse Crops</Link>
                <Link to="/prices" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.85rem' }}>Mandi Rates</Link>
                <Link to="/login" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.85rem' }}>Sign In</Link>
              </Box>
            </Grid>
            <Grid item xs={6} md={2} size={{ xs: 6, md: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} color="#FFFFFF" sx={{ mb: 1.5 }}>
                Legal & Safety
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="caption">Terms of Escrow</Typography>
                <Typography variant="caption">Privacy Policy (DPDP 2023)</Typography>
                <Typography variant="caption">Farmer Protection</Typography>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid #1E293B', textAlign: 'center' }}>
            <Typography variant="caption">
              © 2026 KhetSetu Marketplace. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
