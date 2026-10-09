import { Box, Typography, Paper, Button, Chip } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import {
  MdAddCircleOutline,
  MdShoppingBag,
  MdStorefront,
  MdAccountBalanceWallet,
  MdPayments,
  MdArrowForward,
  MdVerifiedUser,
  MdOutlineTimer,
  MdLocalShipping,
  MdLocalOffer,
  MdGavel,
  MdRefresh,
  MdTrendingUp,
  MdCheckCircle,
} from 'react-icons/md';
import { useGetSellerProductsQuery, useGetSellerOrdersQuery, useGetProfileQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';
import PageHeader from '../../common/custom/PageHeader';
import KPICard from '../../common/custom/KPICard';
import StatusBadge from '../../common/custom/StatusBadge';
import { formatINR, formatQty } from '../../common/status';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data: userProfile } = useGetProfileQuery();
  const { data: productsData } = useGetSellerProductsQuery({ limit: 10 });
  const { data: ordersData } = useGetSellerOrdersQuery({ limit: 10 });

  const kycStatus = userProfile?.seller_profile?.kyc_status || 'unverified';
  const products = Array.isArray(productsData?.items)
    ? productsData.items
    : Array.isArray(productsData?.data)
    ? productsData.data
    : [];
  const orders = Array.isArray(ordersData?.items)
    ? ordersData.items
    : Array.isArray(ordersData?.data)
    ? ordersData.data
    : [];

  // Metrics
  const liveListingsCount = products.filter((p) => p.status === 'live').length;
  const soldOutListings = products.filter((p) => p.status === 'sold_out');
  const needsAcceptOrders = orders.filter((o) => o.status === 'escrow_held');
  const needsDispatchOrders = orders.filter((o) => o.status === 'accepted');
  const actionRequiredOrders = [...needsAcceptOrders, ...needsDispatchOrders];

  let totalPaidOutPaise = 0;
  let totalEscrowLockedPaise = 0;

  for (const o of orders) {
    if (o.status === 'completed') {
      totalPaidOutPaise += Number(o.payout_paise || 0);
    } else if (o.status !== 'cancelled' && o.status !== 'refunded') {
      totalEscrowLockedPaise += Number(o.payout_paise || 0);
    }
  }

  const handleAddCropClick = () => {
    if (kycStatus !== 'verified') {
      toast.warning(t('farmer.completeKycFirst', 'Please complete your Farm KYC first'));
      navigate('/seller/profile');
      return;
    }
    navigate('/seller/products/new');
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* 1. Page Header */}
      <PageHeader
        title={t('farmerDashboardTitle', '🌾 Farmer Dashboard')}
        subtitle={t('farmerDashboardSubtitle', 'Manage your live crop harvests, escrow order contracts, and bank disbursements.')}
        actions={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              component={Link}
              to="/seller/analytics"
              variant="outlined"
              startIcon={<MdTrendingUp />}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              Sales Analytics
            </Button>
            <Button
              onClick={handleAddCropClick}
              variant="contained"
              color="primary"
              startIcon={<MdAddCircleOutline size={20} />}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              {t('addNewCrop', 'Add New Crop')}
            </Button>
          </Box>
        }
      />

      {/* Row 0: Urgent Action Alerts */}
      {kycStatus !== 'verified' ? (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
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
                {t('kycRequiredTitle', 'Farm Profile & Land Verification Required')}
              </Typography>
              <Typography variant="body2" color="#B45309">
                {t('kycRequiredDesc', 'Submit your 7/12 land record and bank account to unlock live selling on KhetSetu Mandi.')}
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
      ) : null}

      {/* Row 1: Action Center Strip */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3.5,
          borderRadius: 3.5,
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
            🎯 Action Center
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Pending tasks requiring your immediate attention today
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            component={Link}
            to="/seller/orders"
            variant="outlined"
            size="small"
            startIcon={<MdOutlineTimer color="#D97706" />}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              borderColor: needsAcceptOrders.length > 0 ? '#FCD34D' : '#E2E8F0',
              bgcolor: needsAcceptOrders.length > 0 ? '#FFFBEB' : '#FFFFFF',
              color: needsAcceptOrders.length > 0 ? '#B45309' : '#475569',
            }}
          >
            Accept Orders ({needsAcceptOrders.length})
          </Button>

          <Button
            component={Link}
            to="/seller/orders"
            variant="outlined"
            size="small"
            startIcon={<MdLocalShipping color="#2563EB" />}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              borderColor: needsDispatchOrders.length > 0 ? '#BFDBFE' : '#E2E8F0',
              bgcolor: needsDispatchOrders.length > 0 ? '#EFF6FF' : '#FFFFFF',
              color: needsDispatchOrders.length > 0 ? '#1D4ED8' : '#475569',
            }}
          >
            Dispatch ({needsDispatchOrders.length})
          </Button>

          <Button
            component={Link}
            to="/seller/offers"
            variant="outlined"
            size="small"
            startIcon={<MdLocalOffer color="#7C3AED" />}
            sx={{ borderRadius: 2, fontWeight: 700, borderColor: '#E2E8F0', color: '#475569' }}
          >
            Offers (0)
          </Button>

          <Button
            component={Link}
            to="/seller/disputes"
            variant="outlined"
            size="small"
            startIcon={<MdGavel color="#64748B" />}
            sx={{ borderRadius: 2, fontWeight: 700, borderColor: '#E2E8F0', color: '#475569' }}
          >
            Disputes (0)
          </Button>
        </Box>
      </Paper>

      {/* Row 2: KPI Strip (Uniform full-width grid) */}
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
          value={liveListingsCount}
          subtitle={t('activeInMarket', 'Available on Mandi')}
          color="green"
          onClick={() => navigate('/seller/products')}
        />
        <KPICard
          icon={<MdShoppingBag size={24} />}
          label={t('activeOrders', 'Needs Your Action')}
          value={actionRequiredOrders.length}
          subtitle={t('awaitingDispatch', 'Awaiting accept / dispatch')}
          color="amber"
          onClick={() => navigate('/seller/orders')}
        />
        <KPICard
          icon={<MdAccountBalanceWallet size={24} />}
          label={t('escrowLocked', 'Your Share in Escrow')}
          value={formatINR(totalEscrowLockedPaise, true, language)}
          subtitle={t('securedInVault', 'Released upon delivery')}
          color="blue"
          onClick={() => navigate('/seller/earnings')}
        />
        <KPICard
          icon={<MdPayments size={24} />}
          label={t('totalEarnings', 'Settled to Bank (All-Time)')}
          value={formatINR(totalPaidOutPaise, true, language)}
          subtitle={t('paidToBank', 'Paid directly via NEFT/UPI')}
          color="purple"
          onClick={() => navigate('/seller/earnings')}
        />
      </Box>

      {/* Row 3: Two Column Snapshot: Actionable Orders & Listings Restock */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' }, gap: 3, mb: 4 }}>
        {/* Left Column: Action-Required Orders (Findings 1 & 7 fixed) */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                📦 Orders Needing Action
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Orders requiring immediate harvesting, packing, or dispatch confirmation
              </Typography>
            </Box>
            <Button
              component={Link}
              to="/seller/orders"
              size="small"
              endIcon={<MdArrowForward />}
              sx={{ fontWeight: 700, color: '#2563EB', textTransform: 'none' }}
            >
              View All Orders
            </Button>
          </Box>

          {actionRequiredOrders.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: 2.5 }}>
              <MdCheckCircle size={32} color="#16A34A" />
              <Typography variant="body2" fontWeight={700} color="#0F172A" sx={{ mt: 1 }}>
                All clear! No orders pending action.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                New buyer orders will appear here with an acceptance timer.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {actionRequiredOrders.map((o) => (
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
                      <Typography
                        component={Link}
                        to={`/seller/orders/${o.id}`}
                        variant="subtitle2"
                        fontWeight={800}
                        color="#2563EB"
                        sx={{ textDecoration: 'none' }}
                      >
                        #{o.order_number}
                      </Typography>
                      <StatusBadge status={o.status} role="farmer" />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {o.buyer?.buyer_profile?.company_name || 'Agro Trading Co.'} • {o.items?.[0]?.crop_name}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle2" fontWeight={800} color="#16A34A">
                      {formatINR(o.payout_paise, true, language)}
                    </Typography>
                    <Button
                      component={Link}
                      to={`/seller/orders/${o.id}`}
                      size="small"
                      variant="contained"
                      sx={{ textTransform: 'none', py: 0.2, px: 1.5, fontSize: '0.75rem', borderRadius: 1.5 }}
                    >
                      {o.status === 'escrow_held' ? 'Accept' : 'Dispatch'}
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Paper>

        {/* Right Column: Listings Inventory Snapshot & Quick Restock */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                🌾 Crop Inventory Snapshot
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {liveListingsCount} live lots on Mandi
              </Typography>
            </Box>
            <Button
              component={Link}
              to="/seller/products"
              size="small"
              endIcon={<MdArrowForward />}
              sx={{ fontWeight: 700, color: '#2563EB', textTransform: 'none' }}
            >
              My Listings
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {products.slice(0, 4).map((p) => (
              <Box
                key={p.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1.8,
                  borderRadius: 2.5,
                  bgcolor: '#F8FAFC',
                  border: '1px solid #F1F5F9',
                }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                    {p.crop?.name || 'Crop'} ({p.variety || 'Standard'})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Stock: {p.available_quantity} {p.unit} • Grade {p.grade}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                  <StatusBadge status={p.status} role="farmer" />
                  {p.status === 'sold_out' && (
                    <Box sx={{ mt: 0.5 }}>
                      <Button
                        component={Link}
                        to={`/seller/products/${p.id}`}
                        size="small"
                        variant="outlined"
                        startIcon={<MdRefresh size={14} />}
                        sx={{ fontSize: '0.7rem', py: 0.2, px: 1, textTransform: 'none', borderRadius: 1.5 }}
                      >
                        Restock
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            ))}

            {products.length === 0 && (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No crops listed yet.
                </Typography>
                <Button onClick={handleAddCropClick} sx={{ mt: 1, fontWeight: 700 }} variant="outlined" size="small">
                  List Your First Harvest
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default SellerDashboard;
