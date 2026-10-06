import { Box, Typography, Grid, Paper, Button, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  MdAddCircleOutline,
  MdShoppingBag,
  MdStorefront,
  MdAccountBalanceWallet,
  MdPayments,
  MdArrowForward,
  MdVerifiedUser,
} from 'react-icons/md';
import { useGetSellerProductsQuery, useGetSellerOrdersQuery, useGetProfileQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';

const SellerDashboard = () => {
  const { t } = useLanguage();
  const { data: userProfile } = useGetProfileQuery();
  const { data: productsData } = useGetSellerProductsQuery({ limit: 5 });
  const { data: ordersData } = useGetSellerOrdersQuery({ limit: 5 });

  const kycStatus = userProfile?.seller_profile?.kyc_status || 'unverified';
  const products = productsData?.items || [];
  const orders = ordersData?.items || [];

  // Calculate quick stats
  const activeListingsCount = products.filter((p) => p.status === 'live').length;
  const newOrdersCount = orders.filter((o) => o.status === 'escrow_held' || o.status === 'accepted').length;

  let totalSalesPaise = 0;
  let pendingPayoutPaise = 0;

  for (const o of orders) {
    if (o.status === 'completed') {
      totalSalesPaise += Number(o.payout_paise || 0);
    } else if (o.status !== 'cancelled' && o.status !== 'refunded') {
      pendingPayoutPaise += Number(o.payout_paise || 0);
    }
  }

  return (
    <Box>
      {/* Top Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0F172A">
            {t('farmerDashboardTitle')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('farmerDashboardSubtitle')}
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/seller/products/new"
          variant="contained"
          color="primary"
          size="large"
          startIcon={<MdAddCircleOutline size={22} />}
          sx={{ borderRadius: 3, fontWeight: 700 }}
        >
          {t('addNewCrop')}
        </Button>
      </Box>

      {/* KYC Alert Banner for Unverified/Pending Farmers */}
      {kycStatus !== 'verified' && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 4,
            borderRadius: 3.5,
            border: '1px solid #FED7AA',
            bgcolor: '#FFFBEB',
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
                bgcolor: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              <MdVerifiedUser />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={800} color="#92400E">
                {t('kycRequiredTitle')}
              </Typography>
              <Typography variant="body2" color="#B45309">
                {t('kycRequiredDesc')}
              </Typography>
            </Box>
          </Box>
          <Button
            component={Link}
            to="/seller/profile"
            variant="contained"
            sx={{
              bgcolor: '#D97706',
              '&:hover': { bgcolor: '#B45309' },
              borderRadius: 2.5,
              fontWeight: 700,
              px: 3,
            }}
          >
            {t('completeKycNow')}
          </Button>
        </Paper>
      )}

      {/* 4 Big Numbers Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#E8F5E9', color: '#2E7D32' }}>
                <MdStorefront size={24} />
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {t('liveListings')}
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={800} color="#0F172A">
              {activeListingsCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('activeInMarket')}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#FFF4E5', color: '#E65100' }}>
                <MdShoppingBag size={24} />
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {t('activeOrders')}
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={800} color="#0F172A">
              {newOrdersCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('awaitingDispatch')}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#E0F2FE', color: '#0288D1' }}>
                <MdAccountBalanceWallet size={24} />
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {t('escrowLocked')}
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={800} color="#0288D1">
              ₹{(pendingPayoutPaise / 100).toLocaleString('en-IN')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('securedInVault')}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#F0FDF4', color: '#16A34A' }}>
                <MdPayments size={24} />
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {t('totalEarnings')}
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={800} color="#16A34A">
              ₹{(totalSalesPaise / 100).toLocaleString('en-IN')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('paidToBank')}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Orders Overview */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Typography variant="h6" fontWeight={700}>
            {t('incomingOrdersHeading')}
          </Typography>
          <Button component={Link} to="/seller/orders" size="small" endIcon={<MdArrowForward />}>
            {t('viewAllOrders')}
          </Button>
        </Box>

        {orders.length === 0 ? (
          <Typography color="text.secondary" py={4} textAlign="center">
            {t('noIncomingOrders')}
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
                    {t('buyerLabel')}: {o.buyer?.buyer_profile?.company_name || 'Agro Buyer'} • {t('status')}: {o.status.toUpperCase()}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2" fontWeight={800} color="#2E7D32">
                    ₹{(o.payout_paise / 100).toLocaleString('en-IN')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('netPayout')}
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

export default SellerDashboard;
