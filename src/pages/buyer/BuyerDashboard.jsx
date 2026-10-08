import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { MdStorefront, MdShoppingBag, MdSecurity, MdArrowForward, MdVerified, MdAgriculture } from 'react-icons/md';
import { useGetBuyerOrdersQuery, useGetProfileQuery, useGetMarketStatsQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';

const BuyerDashboard = () => {
  const { t, formatCurrency } = useLanguage();
  const { data: userProfile } = useGetProfileQuery();
  const { data: ordersData } = useGetBuyerOrdersQuery({ limit: 5 });
  const { data: marketStats } = useGetMarketStatsQuery();

  const isVerified = userProfile?.buyer_profile?.is_verified ?? false;
  const orders = ordersData?.items || [];

  const activeOrders = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');

  // Live amount currently secured in escrow
  const activeEscrowPaise = orders
    .filter((o) => ['escrow_held', 'accepted', 'dispatched'].includes(o.status))
    .reduce((sum, o) => sum + Number(o.total_paise || 0), 0);

  let totalEscrowPaid = 0;
  for (const o of orders) {
    totalEscrowPaid += Number(o.total_paise || 0);
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0F172A">
            {t('buyerDashboardTitle', '🌾 Buyer Overview')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('buyerDashboardSubtitle', 'Direct farm produce procurement with institutional escrow protection.')}
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/buyer/market"
          variant="contained"
          color="primary"
          size="large"
          startIcon={<MdStorefront size={22} />}
          sx={{ borderRadius: 3, fontWeight: 700 }}
        >
          {t('exploreMandiListings', 'Explore Mandi Listings')}
        </Button>
      </Box>

      {/* Business Trust Verification Banner */}
      {!isVerified && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 4,
            borderRadius: 3.5,
            border: '1px solid #BAE6FD',
            bgcolor: '#F0F9FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                bgcolor: '#E0F2FE',
                color: '#0288D1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              <MdVerified />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={800} color="#0369A1">
                {t('businessVerifyTitle', 'Business & GSTIN Verification (Optional)')}
              </Typography>
              <Typography variant="body2" color="#075985">
                {t('businessVerifyDescLimit', 'Individual buyers can purchase up to ₹25,000 per order. Complete verification to unlock bulk trades and RFQs.')}
              </Typography>
            </Box>
          </Box>
          <Button
            component={Link}
            to="/buyer/profile"
            variant="contained"
            sx={{
              bgcolor: '#0288D1',
              '&:hover': { bgcolor: '#0277BD' },
              borderRadius: 2.5,
              fontWeight: 700,
              px: 3,
            }}
          >
            {t('verifyBusinessBtn', 'Verify Business')}
          </Button>
        </Paper>
      )}

      {/* Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#E0F2FE', color: '#0288D1' }}>
                <MdShoppingBag size={24} />
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {t('activeOrders', 'Active Orders')}
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={800} color="#0F172A">
              {activeOrders.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('ordersBeingDispatched', 'In fulfillment / inspection')}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#E8F5E9', color: '#2E7D32' }}>
                <MdSecurity size={24} />
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {t('escrowProtectionTitle', 'Escrow Protected')}
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={800} color="#2E7D32">
              {activeEscrowPaise > 0 ? formatCurrency(activeEscrowPaise, true) : '₹0'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {activeEscrowPaise > 0
                ? t('escrowProtectionActiveDesc', 'Funds held safely in escrow')
                : t('escrowProtectionEmptyDesc', 'Your payments stay protected until delivery')}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#F8FAFC', color: '#475569' }}>
                <MdStorefront size={24} />
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {t('totalPurchasesTitle', 'Total Purchases')}
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={800} color="#0F172A">
              {formatCurrency(totalEscrowPaid, true)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('totalPurchasesSubtitle', 'Settled & fulfilled escrow orders')}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Market Pulse: Farmers & Produce Available (Section 6.1) */}
      {marketStats && (
        <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3.5, bgcolor: '#F8FAF9', border: '1px solid #E2E8F0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MdAgriculture color="#2E7D32" size={22} />
              <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                {t('market.pulseTitle', 'Market Pulse — Live Produce Supply')}
              </Typography>
            </Box>
            <Button component={Link} to="/buyer/market" size="small" endIcon={<MdArrowForward />}>
              {t('market.browseAllListings', 'Browse Live Produce')}
            </Button>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3} size={{ xs: 6, sm: 3 }}>
              <Box sx={{ p: 1.5, bgcolor: '#FFFFFF', borderRadius: 2.5, border: '1px solid #E2E8F0' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  {t('market.verifiedFarmers', 'Verified Farmers')}
                </Typography>
                <Typography variant="h6" fontWeight={800} color="#2E7D32">
                  {marketStats.verifiedFarmers ?? 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3} size={{ xs: 6, sm: 3 }}>
              <Box sx={{ p: 1.5, bgcolor: '#FFFFFF', borderRadius: 2.5, border: '1px solid #E2E8F0' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  {t('market.liveListings', 'Active Listings')}
                </Typography>
                <Typography variant="h6" fontWeight={800} color="#0F172A">
                  {marketStats.liveListings ?? 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3} size={{ xs: 6, sm: 3 }}>
              <Box sx={{ p: 1.5, bgcolor: '#FFFFFF', borderRadius: 2.5, border: '1px solid #E2E8F0' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  {t('market.cropsAvailable', 'Crops Available')}
                </Typography>
                <Typography variant="h6" fontWeight={800} color="#0288D1">
                  {marketStats.cropsAvailable ?? 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3} size={{ xs: 6, sm: 3 }}>
              <Box sx={{ p: 1.5, bgcolor: '#FFFFFF', borderRadius: 2.5, border: '1px solid #E2E8F0' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  {t('market.totalVolume', 'Available Volume')}
                </Typography>
                <Typography variant="h6" fontWeight={800} color="#7C3AED">
                  {marketStats.totalQtyTonnes ? `${marketStats.totalQtyTonnes} MT` : 'Available'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Orders List */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Typography variant="h6" fontWeight={700}>
            {t('recentPurchases', 'Recent Escrow Purchases')}
          </Typography>
          <Button component={Link} to="/buyer/orders" size="small" endIcon={<MdArrowForward />}>
            {t('viewAllOrders', 'View All Orders')}
          </Button>
        </Box>

        {orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: '#F8FAF9',
                border: '2px dashed #CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                fontSize: 26,
              }}
            >
              📦
            </Box>
            <Typography variant="subtitle1" fontWeight={700} color="#0F172A" gutterBottom>
              {t('noPurchasesYet', 'No purchases made yet')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 380, mx: 'auto' }}>
              {t('browseCropsToStart', 'Explore live harvests from verified farmers with 100% escrow buyer protection.')}
            </Typography>
            <Button
              component={Link}
              to="/buyer/market"
              variant="contained"
              color="primary"
              startIcon={<MdStorefront />}
              sx={{ borderRadius: 2.5, fontWeight: 700 }}
            >
              {t('exploreMandiListings', 'Explore Mandi Listings')}
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {orders.map((o) => (
              <Box
                key={o.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: '#F8FAF9',
                  border: '1px solid #F1F5F9',
                }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {t('orderNum')} #{o.order_number}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('farmerLabel')}: {o.seller?.seller_profile?.full_name || 'Farmer'} • {t('status')}: {o.status.toUpperCase()}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2" fontWeight={800} color="#2E7D32">
                    ₹{(o.total_paise / 100).toLocaleString('en-IN')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('escrowProtectedTag')}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default BuyerDashboard;
