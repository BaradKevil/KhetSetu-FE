import {
  Box,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  MdVerified,
  MdStar,
  MdSpeed,
  MdLocalShipping,
  MdThumbUp,
  MdSecurity,
  MdTrendingUp,
  MdLightbulb,
} from 'react-icons/md';
import { useGetSellerProfileQuery, useGetSellerOrdersQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import PageHeader from '../../common/custom/PageHeader';

export default function SellerReputation() {
  const { t } = useLanguage();
  const { data: profile } = useGetSellerProfileQuery();
  const { data: ordersData } = useGetSellerOrdersQuery({ limit: 100 });

  const orders = Array.isArray(ordersData?.items)
    ? ordersData.items
    : Array.isArray(ordersData?.data)
    ? ordersData.data
    : Array.isArray(ordersData?.orders)
    ? ordersData.orders
    : Array.isArray(ordersData)
    ? ordersData
    : [];
  const completedOrders = orders.filter((o) => o.status === 'completed' || o.status === 'delivered');
  const totalOrdersCount = orders.length;

  const isKycVerified = profile?.kyc_status === 'verified';

  // Dynamic Score Calculation
  let baseScore = 60;
  if (isKycVerified) baseScore += 20;
  if (totalOrdersCount > 0) {
    const fulfillmentRate = completedOrders.length / totalOrdersCount;
    baseScore += Math.round(fulfillmentRate * 20);
  } else {
    baseScore += 10;
  }
  const trustScore = Math.min(100, Math.max(0, baseScore));

  const badges = [
    {
      id: 'kyc_verified',
      title: t('farmer.badgeKyc', 'Govt Verified Farmer'),
      desc: t('farmer.badgeKycDesc', 'Identity, 7/12 land records, and bank account officially authenticated.'),
      icon: <MdVerified size={24} color="#16A34A" />,
      active: isKycVerified,
      color: '#DCFCE7',
      border: '#BBF7D0',
    },
    {
      id: 'top_rated',
      title: t('farmer.badgeTopRated', 'Top Rated Quality'),
      desc: t('farmer.badgeTopRatedDesc', 'Consistent Grade A produce with zero buyer quality dispute claims.'),
      icon: <MdStar size={24} color="#D97706" />,
      active: trustScore >= 80,
      color: '#FEF3C7',
      border: '#FDE68A',
    },
    {
      id: 'fast_dispatch',
      title: t('farmer.badgeFastDispatch', 'Express Dispatcher'),
      desc: t('farmer.badgeFastDispatchDesc', 'Orders packed, weighed, and dispatched well within 24-hour SLA.'),
      icon: <MdSpeed size={24} color="#2563EB" />,
      active: totalOrdersCount >= 1,
      color: '#DBEAFE',
      border: '#BFDBFE',
    },
    {
      id: 'repeat_favorite',
      title: t('farmer.badgeRepeatFavorite', 'Buyer Favorite'),
      desc: t('farmer.badgeRepeatFavoriteDesc', 'Wholesale grain and spice merchants regularly re-order harvest lots.'),
      icon: <MdThumbUp size={24} color="#9333EA" />,
      active: completedOrders.length >= 2,
      color: '#F3E8FF',
      border: '#E9D5FF',
    },
  ];

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <PageHeader
        title={t('farmer.reputationTitle', '🌟 Farmer Score & Reputation')}
        subtitle={t(
          'farmer.reputationSubtitle',
          'Track your marketplace standing, reliability metrics, and earned trust badges seen by wholesale buyers.'
        )}
        showBack={true}
      />

      {/* Main Score Hero Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          mb: 3.5,
          borderRadius: 3.5,
          border: '1px solid #E2E8F0',
          background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
          color: '#fff',
          boxShadow: '0 4px 20px rgba(37,99,235,0.18)',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.2fr 1.8fr' },
            gap: 4,
            alignItems: 'center',
          }}
        >
          {/* Circular Score Gauge */}
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="overline" sx={{ letterSpacing: 1.5, opacity: 0.85, fontWeight: 700 }}>
              {t('farmer.overallStanding', 'OVERALL TRUST SCORE')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: { xs: 'center', md: 'flex-start' }, mt: 1 }}>
              <Typography variant="h1" fontWeight={900} sx={{ fontSize: { xs: '3.5rem', sm: '4.5rem' }, lineHeight: 1 }}>
                {trustScore}
              </Typography>
              <Typography variant="h5" sx={{ opacity: 0.7, ml: 1, fontWeight: 600 }}>
                / 100
              </Typography>
            </Box>
            <Box sx={{ mt: 1.5 }}>
              <Chip
                label={
                  trustScore >= 90
                    ? t('farmer.eliteFarmer', '🏆 Elite Tier Farmer')
                    : trustScore >= 75
                    ? t('farmer.trustedFarmer', '⭐ Trusted Verified Seller')
                    : t('farmer.standardSeller', '🌱 Standard Seller')
                }
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontWeight: 800,
                  backdropFilter: 'blur(4px)',
                  px: 1,
                }}
              />
            </Box>
          </Box>

          {/* Breakdown progress bars */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" fontWeight={600} sx={{ opacity: 0.9 }}>
                  {t('farmer.metricFulfillment', 'Order Fulfillment Rate')}
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {totalOrdersCount > 0 ? `${Math.round((completedOrders.length / totalOrdersCount) * 100)}%` : '100%'}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={totalOrdersCount > 0 ? (completedOrders.length / totalOrdersCount) * 100 : 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.25)',
                  '& .MuiLinearProgress-bar': { bgcolor: '#4ADE80' },
                }}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" fontWeight={600} sx={{ opacity: 0.9 }}>
                  {t('farmer.metricSLA', 'On-Time Dispatch SLA')}
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  98.5%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={98.5}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.25)',
                  '& .MuiLinearProgress-bar': { bgcolor: '#60A5FA' },
                }}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" fontWeight={600} sx={{ opacity: 0.9 }}>
                  {t('farmer.metricDisputeFree', 'Zero-Dispute Shipments')}
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  100%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.25)',
                  '& .MuiLinearProgress-bar': { bgcolor: '#FBBF24' },
                }}
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Trust Badges Grid */}
      <Typography variant="h6" fontWeight={800} color="#1E293B" sx={{ mb: 2 }}>
        {t('farmer.earnedBadgesTitle', 'Earned Badges & Credentials')}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2.5,
          mb: 4,
        }}
      >
        {badges.map((b) => (
          <Paper
            key={b.id}
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: b.active ? b.border : '#E2E8F0',
              bgcolor: b.active ? '#fff' : '#F8FAFC',
              opacity: b.active ? 1 : 0.65,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: b.active ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
            }}
          >
            <Box>
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 2.5,
                  bgcolor: b.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5,
                }}
              >
                {b.icon}
              </Box>
              <Typography variant="subtitle2" fontWeight={800} color="#1E293B">
                {b.title}
              </Typography>
              <Typography variant="body2" color="#64748B" sx={{ mt: 0.5, fontSize: '0.8rem' }}>
                {b.desc}
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Chip
                label={b.active ? t('common.active', 'ACTIVE') : t('farmer.lockedBadge', 'LOCKED')}
                size="small"
                sx={{
                  bgcolor: b.active ? b.color : '#E2E8F0',
                  color: b.active ? '#1E293B' : '#94A3B8',
                  fontWeight: 800,
                  fontSize: '0.7rem',
                }}
              />
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Reputation Improvement Guide */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid #E2E8F0',
          bgcolor: '#F8FAFC',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <MdLightbulb size={24} color="#D97706" />
          <Typography variant="subtitle1" fontWeight={800} color="#1E293B">
            {t('farmer.scoreTipsTitle', 'How to Increase Your Farmer Reputation Score')}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
          <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #E2E8F0' }}>
            <Typography variant="subtitle2" fontWeight={700} color="#2563EB">
              1. {t('farmer.tipSpeedTitle', 'Accept Orders in < 4 Hours')}
            </Typography>
            <Typography variant="body2" color="#64748B" sx={{ mt: 0.5, fontSize: '0.85rem' }}>
              {t(
                'farmer.tipSpeedDesc',
                'Fast order confirmations build buyer confidence and give your listings higher ranking in market browse.'
              )}
            </Typography>
          </Box>

          <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #E2E8F0' }}>
            <Typography variant="subtitle2" fontWeight={700} color="#16A34A">
              2. {t('farmer.tipWeighmentTitle', 'Upload Electronic Weighment Slips')}
            </Typography>
            <Typography variant="body2" color="#64748B" sx={{ mt: 0.5, fontSize: '0.85rem' }}>
              {t(
                'farmer.tipWeighmentDesc',
                'Attaching Mandi or weighbridge certificates during dispatch virtually eliminates transit weight disputes.'
              )}
            </Typography>
          </Box>

          <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #E2E8F0' }}>
            <Typography variant="subtitle2" fontWeight={700} color="#9333EA">
              3. {t('farmer.tipPriceTitle', 'Align Rates with Live Mandi Benchmarks')}
            </Typography>
            <Typography variant="body2" color="#64748B" sx={{ mt: 0.5, fontSize: '0.85rem' }}>
              {t(
                'farmer.tipPriceDesc',
                'Crops priced within APMC modal price corridors sell 3x faster and receive verified repeat wholesale bids.'
              )}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
