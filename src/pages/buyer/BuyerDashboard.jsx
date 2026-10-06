import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { MdStorefront, MdShoppingBag, MdSecurity, MdArrowForward, MdVerified } from 'react-icons/md';
import { useGetBuyerOrdersQuery, useGetProfileQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';

const BuyerDashboard = () => {
  const { t } = useLanguage();
  const { data: userProfile } = useGetProfileQuery();
  const { data: ordersData } = useGetBuyerOrdersQuery({ limit: 5 });
  const isVerified = userProfile?.buyer_profile?.is_verified ?? false;
  const orders = ordersData?.items || [];

  const activeOrders = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');

  let totalEscrowPaid = 0;
  for (const o of orders) {
    totalEscrowPaid += Number(o.total_paise || 0);
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0F172A">
            {t('buyerDashboardTitle')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('buyerDashboardSubtitle')}
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
          {t('exploreMandiListings')}
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
                {t('businessVerifyTitle')}
              </Typography>
              <Typography variant="body2" color="#075985">
                {t('businessVerifyDesc')}
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
            {t('verifyBusinessBtn')}
          </Button>
        </Paper>
      )}

      {/* Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#E0F2FE', color: '#0288D1' }}>
                <MdShoppingBag size={24} />
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {t('activeOrders')}
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={800} color="#0F172A">
              {activeOrders.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('ordersBeingDispatched')}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#E8F5E9', color: '#2E7D32' }}>
                <MdSecurity size={24} />
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {t('escrowProtectionTitle')}
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={800} color="#2E7D32">
              {t('escrowProtectionLocked')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('escrowProtectionSubtitle')}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#F8FAFC', color: '#475569' }}>
                <MdStorefront size={24} />
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {t('totalPurchasesTitle')}
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={800} color="#0F172A">
              ₹{(totalEscrowPaid / 100).toLocaleString('en-IN')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('totalPurchasesSubtitle')}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Orders List */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Typography variant="h6" fontWeight={700}>
            {t('recentPurchases')}
          </Typography>
          <Button component={Link} to="/buyer/orders" size="small" endIcon={<MdArrowForward />}>
            {t('viewAllOrders')}
          </Button>
        </Box>

        {orders.length === 0 ? (
          <Typography color="text.secondary" py={4} textAlign="center">
            {t('noPurchasesYet')}
          </Typography>
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
