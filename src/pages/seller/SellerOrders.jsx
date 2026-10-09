import { useState } from 'react';
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
  TextField,
  Grid,
} from '@mui/material';
import { MdCheck, MdLocalShipping, MdInventory2, MdHourglassEmpty, MdCheckCircle } from 'react-icons/md';
import { useGetSellerOrdersQuery, useUpdateOrderStatusMutation } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';
import PageHeader from '../../common/custom/PageHeader';
import KPICard from '../../common/custom/KPICard';
import StatusBadge from '../../common/custom/StatusBadge';

const SellerOrders = () => {
  const { t, formatCurrency } = useLanguage();
  const { data: ordersData, isLoading } = useGetSellerOrdersQuery();
  const updateStatusMutation = useUpdateOrderStatusMutation();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');

  const orders = ordersData?.items || [];

  const handleAcceptOrder = async (orderId) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        status: 'accepted',
        note: 'Order accepted by farmer. Packing harvest for pickup.',
      });
      toast.success(t('farmer.orderAccepted', 'Order accepted! Prepare harvest for dispatch.'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.SOMETHING_WENT_WRONG', 'Error accepting order.'));
    }
  };

  const handleOpenDispatch = (order) => {
    setSelectedOrder(order);
    setDispatchModalOpen(true);
  };

  const handleConfirmDispatch = async () => {
    if (!selectedOrder) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: selectedOrder.id,
        status: 'dispatched',
        note: `Dispatched via vehicle ${vehicleNumber || 'Farmer Transport'}.`,
        dispatch_details: {
          tracking_number: trackingNumber || 'N/A',
          vehicle_number: vehicleNumber || 'Farmer Direct',
          dispatch_date: new Date().toISOString(),
        },
      });
      toast.success(t('farmer.orderDispatched', 'Order marked as dispatched! Buyer notified.'));
      setDispatchModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.SOMETHING_WENT_WRONG', 'Error updating dispatch.'));
    }
  };

  const totalOrders = orders.length;
  const pendingAction = orders.filter((o) => o.status === 'escrow_held' || o.status === 'accepted').length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Page Header */}
      <PageHeader
        title={t('farmer.incomingOrdersHeading', '📦 Incoming Farmer Orders')}
        subtitle={t('farmer.incomingOrdersSubtitle', 'Track buyer orders with locked escrow payment guarantees.')}
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
          label={t('farmer.kpiTotalOrders', 'Total Orders')}
          value={totalOrders}
          subtitle={t('farmer.kpiTotalOrdersSub', 'All-time incoming orders')}
          icon={<MdInventory2 />}
          color="blue"
        />
        <KPICard
          label={t('farmer.kpiPendingAction', 'Action Required')}
          value={pendingAction}
          subtitle={t('farmer.kpiPendingActionSub', 'Awaiting accept / dispatch')}
          icon={<MdHourglassEmpty />}
          color="amber"
        />
        <KPICard
          label={t('farmer.kpiCompletedOrders', 'Completed & Paid')}
          value={completedOrders}
          subtitle={t('farmer.kpiCompletedOrdersSub', 'Settled to farmer account')}
          icon={<MdCheckCircle />}
          color="green"
        />
      </Box>

      {/* Orders Table */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('farmer.orderNum', 'Order #')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('farmer.buyerLabel', 'Buyer Details')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('farmer.cropAndVariety', 'Crops & Quantity')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('farmer.netPayout', 'Net Payout')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('common.status', 'Status')}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>{t('common.actions', 'Action')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  {t('common.loading', 'Loading orders...')}
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No orders received yet.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow key={o.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ fontWeight: 700, color: '#2563EB' }}>
                    #{o.order_number}
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                      {o.buyer?.buyer_profile?.company_name || 'Buyer Enterprise'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {o.delivery_address?.city}, {o.delivery_address?.state}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {o.items?.map((item) => (
                      <Typography key={item.id} variant="body2" sx={{ color: '#334155' }}>
                        {item.crop_name} ({item.variety}) • {item.quantity} {item.unit}
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#16A34A' }}>
                    {formatCurrency(o.payout_paise, true)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} />
                  </TableCell>
                  <TableCell align="right">
                    {o.status === 'escrow_held' && (
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        startIcon={<MdCheck />}
                        onClick={() => handleAcceptOrder(o.id)}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                      >
                        {t('common.accept', 'Accept')}
                      </Button>
                    )}
                    {o.status === 'accepted' && (
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        startIcon={<MdLocalShipping />}
                        onClick={() => handleOpenDispatch(o)}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                      >
                        {t('common.dispatch', 'Dispatch')}
                      </Button>
                    )}
                    {o.status === 'dispatched' && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        On the way to buyer
                      </Typography>
                    )}
                    {o.status === 'completed' && (
                      <Typography variant="caption" color="success.main" fontWeight={700}>
                        ✓ Paid to Bank
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Dispatch Modal */}
      <Dialog open={dispatchModalOpen} onClose={() => setDispatchModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Enter Dispatch Details</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Vehicle Number / Transport (e.g. GJ-02-AB-1234)"
            fullWidth
            size="small"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Driver Phone or Tracking ID (Optional)"
            fullWidth
            size="small"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDispatchModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleConfirmDispatch}>
            Confirm Dispatch
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SellerOrders;
