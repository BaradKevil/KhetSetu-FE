import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Tabs,
  Tab,
  Grid,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { MdCheckCircle, MdTimeline, MdStorefront, MdInventory2, MdHourglassEmpty, MdLocalShipping } from 'react-icons/md';
import { useGetBuyerOrdersQuery, useUpdateOrderStatusMutation } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';
import PageHeader from '../../common/custom/PageHeader';
import KPICard from '../../common/custom/KPICard';
import StatusBadge from '../../common/custom/StatusBadge';

const BuyerOrders = () => {
  const { t, formatCurrency, formatDate } = useLanguage();
  const { data: ordersData, isLoading } = useGetBuyerOrdersQuery();
  const updateStatusMutation = useUpdateOrderStatusMutation();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const orders = ordersData?.items || [];

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orders;
    if (activeTab === 'escrow') return orders.filter((o) => ['escrow_held', 'accepted'].includes(o.status));
    if (activeTab === 'dispatched') return orders.filter((o) => o.status === 'dispatched');
    if (activeTab === 'delivered') return orders.filter((o) => ['delivered', 'completed'].includes(o.status));
    return orders;
  }, [orders, activeTab]);

  const orderSteps = [
    t('buyer.stepPlaced', 'Order Placed'),
    t('buyer.stepEscrowHeld', 'Escrow Held'),
    t('buyer.stepAccepted', 'Accepted'),
    t('buyer.stepDispatched', 'Dispatched'),
    t('buyer.stepDelivered', 'Delivered & Released'),
  ];

  const handleConfirmDelivery = async (orderId) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        status: 'delivered',
        note: 'Buyer inspected produce and confirmed delivery. Escrow funds released to farmer.',
      });
      toast.success(t('buyer.deliveryConfirmedSuccess', 'Delivery confirmed! Payment successfully released to the farmer.'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.SOMETHING_WENT_WRONG', 'Error updating status.'));
    }
  };

  const getActiveStep = (status) => {
    switch (status) {
      case 'pending_payment': return 0;
      case 'escrow_held': return 1;
      case 'accepted': return 2;
      case 'dispatched': return 3;
      case 'delivered':
      case 'completed': return 4;
      default: return 1;
    }
  };

  const totalOrders = orders.length;
  const inEscrowOrders = orders.filter((o) => ['escrow_held', 'accepted'].includes(o.status)).length;
  const dispatchedOrders = orders.filter((o) => o.status === 'dispatched').length;

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Page Header */}
      <PageHeader
        title={t('buyer.buyerOrdersTitle', '📦 My Escrow Orders')}
        subtitle={t('buyer.buyerOrdersSubtitle', 'Track real-time dispatch progress. Confirm delivery once goods arrive to release farmer payout.')}
      />

      {/* KPI Cards Row (Uniform full-width grid) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2.5,
          mb: 3.5,
          width: '100%',
        }}
      >
        <KPICard
          label={t('common.all', 'Total Orders')}
          value={totalOrders}
          subtitle={t('buyer.totalOrdersSub', 'All-time procurement')}
          icon={<MdInventory2 />}
          color="blue"
        />
        <KPICard
          label={t('buyer.inEscrow', 'In Escrow')}
          value={inEscrowOrders}
          subtitle={t('buyer.inEscrowSub', 'Awaiting dispatch')}
          icon={<MdHourglassEmpty />}
          color="amber"
        />
        <KPICard
          label={t('buyer.dispatched', 'Dispatched')}
          value={dispatchedOrders}
          subtitle={t('buyer.dispatchedSub', 'In transit to destination')}
          icon={<MdLocalShipping />}
          color="cyan"
        />
      </Box>

      {/* Filter Tabs */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Tabs
          value={activeTab}
          onChange={(_e, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ px: 2 }}
        >
          <Tab value="all" label={`${t('common.all', 'All Orders')} (${orders.length})`} sx={{ fontWeight: 700 }} />
          <Tab
            value="escrow"
            label={`${t('buyer.inEscrow', 'In Escrow')} (${inEscrowOrders})`}
            sx={{ fontWeight: 700 }}
          />
          <Tab
            value="dispatched"
            label={`${t('buyer.dispatched', 'Dispatched')} (${dispatchedOrders})`}
            sx={{ fontWeight: 700 }}
          />
          <Tab
            value="delivered"
            label={`${t('buyer.completed', 'Delivered')} (${orders.filter((o) => ['delivered', 'completed'].includes(o.status)).length})`}
            sx={{ fontWeight: 700 }}
          />
        </Tabs>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('buyer.orderNumber', 'Order #')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('farmer.farmerSeller', 'Farmer (Seller)')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('farmer.cropAndVariety', 'Produce Items')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('buyer.totalEscrow', 'Total Escrow')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('common.status', 'Current Status')}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>{t('common.actions', 'Actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  {t('common.loading', 'Loading orders...')}
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Box sx={{ maxWidth: 380, mx: 'auto', textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: '#F8FAFC',
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
                      {t('buyer.noPurchasesYet', 'No orders found')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                      {t('buyer.startProcuring', 'Start exploring verified harvest listings with direct farmer pricing and escrow buyer protection.')}
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
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((o) => (
                <TableRow key={o.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ fontWeight: 700, color: '#2563EB' }}>#{o.order_number}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                      {o.seller?.seller_profile?.full_name || t('buyer.farmerLabel', 'Farmer Seller')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {o.seller?.seller_profile?.district}, {o.seller?.seller_profile?.state}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {o.items?.map((item) => (
                      <Typography key={item.id} variant="body2" sx={{ color: '#334155' }}>
                        {item.crop_name} ({item.variety}) • {item.quantity} {item.unit}
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>
                    {formatCurrency(o.total_paise, true)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setSelectedOrder(o);
                          setTimelineModalOpen(true);
                        }}
                        startIcon={<MdTimeline />}
                      >
                        {t('buyer.timeline', 'Timeline')}
                      </Button>

                      {o.status === 'dispatched' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<MdCheckCircle />}
                          onClick={() => handleConfirmDelivery(o.id)}
                        >
                          {t('buyer.confirmDelivery', 'Confirm & Release')}
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Timeline Modal */}
      <Dialog open={timelineModalOpen} onClose={() => setTimelineModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {t('buyer.orderTracking', 'Order Tracking')}: #{selectedOrder?.order_number}
        </DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Box sx={{ py: 2 }}>
              <Stepper activeStep={getActiveStep(selectedOrder.status)} alternativeLabel sx={{ mb: 4 }}>
                {orderSteps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                {t('buyer.auditEvents', 'Audit Log Timeline Events')}:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {selectedOrder.timeline?.map((event, idx) => (
                  <Box key={idx} sx={{ p: 1.5, bgcolor: '#F8FAF9', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" fontWeight={700} color="primary">
                        {event.status.toUpperCase()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(event.timestamp, { dateStyle: 'short', timeStyle: 'short' })}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {event.note}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setTimelineModalOpen(false)}>{t('common.close', 'Close')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BuyerOrders;
