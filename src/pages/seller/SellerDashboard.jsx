import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
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
import { toast } from 'react-toastify';
import PageHeader from '../../common/custom/PageHeader';
import KPICard from '../../common/custom/KPICard';
import StatusBadge from '../../common/custom/StatusBadge';

const SellerDashboard = () => {
  const navigate = useNavigate();
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
      {/* 1. Page Header (Reference Design) */}
      <PageHeader
        title={t('farmerDashboardTitle', 'Farmer Dashboard')}
        subtitle={t('farmerDashboardSubtitle', 'Manage your live crop harvests, escrow order contracts, and bank disbursements.')}
        actions={
          <Button
            onClick={() => {
              if (kycStatus !== 'verified') {
                toast.warning(t('farmer.completeKycFirst', 'Please complete the KYC first'));
                navigate('/seller/kyc');
                return;
              }
              navigate('/seller/products/new');
            }}
            variant="contained"
            color="primary"
            startIcon={<MdAddCircleOutline size={20} />}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            {t('addNewCrop', 'Add New Crop')}
          </Button>
        }
      />

      {/* KYC Alert Banner for Unverified/Pending Farmers */}
      {kycStatus !== 'verified' && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3.5,
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
                {t('kycRequiredTitle', 'Farm Profile & Verification Required')}
              </Typography>
              <Typography variant="body2" color="#B45309">
                {t('kycRequiredDesc', 'Complete KYC with your land records & bank account to unlock crop selling on Mandi.')}
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
              borderRadius: 2,
              fontWeight: 700,
              px: 3,
            }}
          >
            {t('completeKycNow', 'Complete KYC Now')}
          </Button>
        </Paper>
      )}

      {/* 2. KPI Cards Row (Uniform full-width grid) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2.5,
          mb: 3.5,
          width: '100%',
        }}
      >
        <KPICard
          icon={<MdStorefront size={24} />}
          label={t('liveListings', 'Live Crop Listings')}
          value={activeListingsCount}
          subtitle={t('activeInMarket', 'Active on Mandi')}
          color="blue"
          onClick={() => navigate('/seller/products')}
        />
        <KPICard
          icon={<MdShoppingBag size={24} />}
          label={t('activeOrders', 'Active Orders')}
          value={newOrdersCount}
          subtitle={t('awaitingDispatch', 'Awaiting Dispatch')}
          color="purple"
          onClick={() => navigate('/seller/orders')}
        />
        <KPICard
          icon={<MdAccountBalanceWallet size={24} />}
          label={t('escrowLocked', 'Escrow Locked')}
          value={`₹${(pendingPayoutPaise / 100).toLocaleString('en-IN')}`}
          subtitle={t('securedInVault', 'Secured in Vault')}
          color="cyan"
          onClick={() => navigate('/seller/earnings')}
        />
        <KPICard
          icon={<MdPayments size={24} />}
          label={t('totalEarnings', 'Total Earnings')}
          value={`₹${(totalSalesPaise / 100).toLocaleString('en-IN')}`}
          subtitle={t('paidToBank', 'Settled to Bank')}
          color="green"
          onClick={() => navigate('/seller/earnings')}
        />
      </Box>

      {/* 3. Recent Orders Overview (Reference Screenshot 1 style table/list card) */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Box>
            <Typography variant="h6" fontWeight={700} color="#0F172A">
              {t('incomingOrdersHeading', 'Recent Incoming Orders')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Orders requiring harvesting, packing, or dispatch confirmation
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/seller/orders"
            size="small"
            endIcon={<MdArrowForward />}
            sx={{ fontWeight: 600, color: '#2563EB' }}
          >
            {t('viewAllOrders', 'View All Orders')}
          </Button>
        </Box>

        {orders.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('noIncomingOrders', 'No incoming orders currently.')}
            </Typography>
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
                  bgcolor: '#F8FAFC',
                  border: '1px solid #F1F5F9',
                  transition: 'all 0.15s ease',
                  '&:hover': { bgcolor: '#F1F5F9' },
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                      {t('orderNum', 'Order')} #{o.order_number}
                    </Typography>
                    <StatusBadge status={o.status} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('buyerLabel', 'Buyer')}: {o.buyer?.buyer_profile?.company_name || 'Agro Buyer'}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2" fontWeight={800} color="#2563EB">
                    ₹{(o.payout_paise / 100).toLocaleString('en-IN')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('netPayout', 'Net Payout')}
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
