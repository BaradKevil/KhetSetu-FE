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
  Tabs,
  Tab,
  MenuItem,
  InputAdornment,
  Tooltip,
  IconButton,
  Chip,
} from '@mui/material';
import {
  MdCheck,
  MdClose,
  MdLocalShipping,
  MdInventory2,
  MdHourglassEmpty,
  MdCheckCircle,
  MdSearch,
  MdOutlineTimer,
  MdVisibility,
  MdLocalAtm,
} from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { useGetSellerOrdersQuery, useUpdateOrderStatusMutation } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';
import PageHeader from '../../common/custom/PageHeader';
import KPICard from '../../common/custom/KPICard';
import StatusBadge from '../../common/custom/StatusBadge';
import { formatINR, formatQty, formatIST, REJECT_REASONS } from '../../common/status';

const SellerOrders = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { data: ordersData, isLoading } = useGetSellerOrdersQuery();
  const updateStatusMutation = useUpdateOrderStatusMutation();

  const [activeTab, setActiveTab] = useState('needs_action');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReasonCode, setRejectReasonCode] = useState('OUT_OF_STOCK');
  const [rejectNote, setRejectNote] = useState('');

  // Dispatch Modal State
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchMode, setDispatchMode] = useState('farmer_direct');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [weighmentKg, setWeighmentKg] = useState('');
  const [etaDays, setEtaDays] = useState('2');

  const orders = Array.isArray(ordersData?.items)
    ? ordersData.items
    : Array.isArray(ordersData?.data)
    ? ordersData.data
    : [];

  // Tab Filtering logic
  const filteredOrders = orders.filter((o) => {
    // Search query matching
    const q = searchQuery.toLowerCase().trim();
    const orderNo = String(o.order_number || '').toLowerCase();
    const buyerName = String(o.buyer?.buyer_profile?.company_name || '').toLowerCase();
    const cropName = o.items?.map((i) => i.crop_name?.toLowerCase()).join(' ') || '';
    const matchesSearch = !q || orderNo.includes(q) || buyerName.includes(q) || cropName.includes(q);

    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'needs_action') {
      return o.status === 'escrow_held' || o.status === 'accepted' || o.status === 'packing';
    }
    if (activeTab === 'dispatched') {
      return o.status === 'dispatched';
    }
    if (activeTab === 'delivered') {
      return o.status === 'delivered';
    }
    if (activeTab === 'completed') {
      return o.status === 'completed';
    }
    if (activeTab === 'disputed_cancelled') {
      return o.status === 'disputed' || o.status === 'cancelled' || o.status === 'refunded';
    }
    return true;
  });

  // Action handlers
  const handleAcceptOrder = async (orderId) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        status: 'accepted',
        note: 'Order accepted by farmer. Packing harvest lot for dispatch.',
      });
      toast.success(t('farmer.orderAccepted', 'Order accepted! Please prepare harvest for dispatch.'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.SOMETHING_WENT_WRONG', 'Error accepting order.'));
    }
  };

  const handleOpenReject = (order) => {
    setSelectedOrder(order);
    setRejectReasonCode('OUT_OF_STOCK');
    setRejectNote('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedOrder) return;
    try {
      const selectedReason = REJECT_REASONS.find((r) => r.code === rejectReasonCode)?.label || rejectReasonCode;
      const fullReason = `${selectedReason}${rejectNote ? ` - ${rejectNote}` : ''}`;

      await updateStatusMutation.mutateAsync({
        id: selectedOrder.id,
        status: 'cancelled',
        note: fullReason,
        cancelled_reason: fullReason,
      });
      toast.info(t('farmer.orderRejected', 'Order rejected. Escrow payment released back to buyer.'));
      setRejectModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.SOMETHING_WENT_WRONG', 'Error rejecting order.'));
    }
  };

  const handleOpenDispatch = (order) => {
    setSelectedOrder(order);
    setVehicleNumber('');
    setDriverName('');
    setDriverPhone('');
    setWeighmentKg(order?.items?.[0]?.quantity ? String(order.items[0].quantity * 100) : '');
    setDispatchModalOpen(true);
  };

  const handleConfirmDispatch = async () => {
    if (!selectedOrder) return;
    if (!vehicleNumber.trim()) {
      toast.warning('Please enter a vehicle registration number (e.g. GJ-03-AB-1234)');
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        id: selectedOrder.id,
        status: 'dispatched',
        note: `Dispatched via ${vehicleNumber}. Driver: ${driverName || 'Self'}.`,
        dispatch_details: {
          mode: dispatchMode,
          vehicle_number: vehicleNumber.toUpperCase().trim(),
          driver_name: driverName.trim(),
          driver_phone: driverPhone.trim(),
          weighment_kg: Number(weighmentKg) || null,
          eta_days: Number(etaDays) || 2,
          dispatch_date: new Date().toISOString(),
        },
      });
      toast.success(t('farmer.orderDispatched', 'Order marked dispatched! Buyer and logistics notified.'));
      setDispatchModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.SOMETHING_WENT_WRONG', 'Error updating dispatch details.'));
    }
  };

  // KPI Calculations
  const totalOrders = orders.length;
  const needsActionCount = orders.filter((o) => o.status === 'escrow_held' || o.status === 'accepted').length;
  const inTransitCount = orders.filter((o) => o.status === 'dispatched').length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;

  let totalEscrowSharePaise = 0;
  for (const o of orders) {
    if (o.status !== 'completed' && o.status !== 'cancelled' && o.status !== 'refunded') {
      totalEscrowSharePaise += Number(o.payout_paise || 0);
    }
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* 1. Page Header */}
      <PageHeader
        title={t('farmer.incomingOrdersHeading', '📦 Incoming Farmer Orders')}
        subtitle={t('farmer.incomingOrdersSubtitle', 'Fulfill verified buyer purchase contracts backed by 100% escrow vault guarantees.')}
        actions={
          <Button
            component={Link}
            to="/seller/earnings"
            variant="outlined"
            startIcon={<MdLocalAtm />}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            {t('farmer.viewEarnings', 'Payout Statements')}
          </Button>
        }
      />

      {/* 2. KPI Cards Row (Uniform full-width grid) */}
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
          label={t('farmer.kpiPendingAction', 'Needs Your Action')}
          value={needsActionCount}
          subtitle={t('farmer.kpiPendingActionSub', 'Awaiting acceptance or vehicle dispatch')}
          icon={<MdHourglassEmpty />}
          color="amber"
          onClick={() => setActiveTab('needs_action')}
        />
        <KPICard
          label={t('farmer.kpiInTransit', 'On the Way (Dispatched)')}
          value={inTransitCount}
          subtitle={t('farmer.kpiInTransitSub', 'Harvest en-route to buyer delivery gate')}
          icon={<MdLocalShipping />}
          color="blue"
          onClick={() => setActiveTab('dispatched')}
        />
        <KPICard
          label={t('farmer.kpiCompletedOrders', 'Completed & Paid to Bank')}
          value={completedOrders}
          subtitle={t('farmer.kpiCompletedOrdersSub', 'Settled via direct NEFT / UPI disbursement')}
          icon={<MdCheckCircle />}
          color="green"
          onClick={() => setActiveTab('completed')}
        />
      </Box>

      {/* 3. Filter Tabs & Search Bar */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                minHeight: 42,
              },
            }}
          >
            <Tab
              value="needs_action"
              label={`Needs Action (${needsActionCount})`}
              sx={{ color: needsActionCount > 0 ? '#D97706 !important' : undefined }}
            />
            <Tab value="dispatched" label={`On the Way (${inTransitCount})`} />
            <Tab value="delivered" label="Delivered" />
            <Tab value="completed" label={`Completed & Paid (${completedOrders})`} />
            <Tab value="disputed_cancelled" label="Cancelled / Disputed" />
            <Tab value="all" label={`All Orders (${totalOrders})`} />
          </Tabs>

          <TextField
            size="small"
            placeholder={t('farmer.searchOrders', 'Search order #, buyer or crop...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MdSearch size={20} color="#94A3B8" />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: 280 } }}
          />
        </Box>
      </Paper>

      {/* 4. Orders Table */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('farmer.orderNum', 'Order #')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('farmer.date', 'Order Date')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('farmer.buyerLabel', 'Buyer Details')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('farmer.cropAndQuantity', 'Crop & Quantity')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('farmer.netPayout', 'Your Net Payout')}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>{t('common.status', 'Status')}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>
                {t('common.actions', 'Action')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  {t('common.loading', 'Loading orders...')}
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography variant="body1" fontWeight={600} color="text.secondary">
                    {t('farmer.noOrdersInTab', 'No orders in this category.')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((o) => (
                <TableRow key={o.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Typography
                      component={Link}
                      to={`/seller/orders/${o.id}`}
                      variant="subtitle2"
                      fontWeight={800}
                      sx={{ color: '#2563EB', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      #{o.order_number}
                    </Typography>
                    {o.status === 'escrow_held' && (
                      <Chip
                        icon={<MdOutlineTimer size={12} />}
                        label="Accept in 12h"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor: '#FEF3C7',
                          color: '#B45309',
                          mt: 0.5,
                        }}
                      />
                    )}
                  </TableCell>

                  <TableCell sx={{ color: '#64748B', fontSize: '0.85rem' }}>
                    {formatIST(o.created_at)}
                  </TableCell>

                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                      {o.buyer?.buyer_profile?.company_name || 'Agro Trading Co.'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {o.delivery_address?.city || o.delivery_address?.district || 'Buyer Location'}, {o.delivery_address?.state || ''}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {o.items?.map((item) => (
                      <Box key={item.id}>
                        <Typography variant="body2" fontWeight={700} sx={{ color: '#1E293B' }}>
                          {item.crop_name} ({item.variety || 'Standard'})
                        </Typography>
                        <Typography variant="caption" color="#64748B">
                          Grade {item.grade || 'A'} • {formatQty(item.quantity, item.unit || 'Quintal', language)}
                        </Typography>
                      </Box>
                    ))}
                  </TableCell>

                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#16A34A' }}>
                      {formatINR(o.payout_paise, true, language)}
                    </Typography>
                    <Typography variant="caption" color="#64748B">
                      (After 2.5% fee)
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={o.status} role="farmer" />
                  </TableCell>

                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
                      {/* Action buttons based on lifecycle */}
                      {o.status === 'escrow_held' && (
                        <>
                          <Button
                            variant="contained"
                            size="small"
                            color="success"
                            startIcon={<MdCheck />}
                            onClick={() => handleAcceptOrder(o.id)}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                          >
                            {t('common.accept', 'Accept')}
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            startIcon={<MdClose />}
                            onClick={() => handleOpenReject(o)}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                          >
                            {t('common.reject', 'Reject')}
                          </Button>
                        </>
                      )}

                      {o.status === 'accepted' && (
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          startIcon={<MdLocalShipping />}
                          onClick={() => handleOpenDispatch(o)}
                          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                        >
                          {t('common.dispatch', 'Dispatch')}
                        </Button>
                      )}

                      <Tooltip title={t('common.viewDetails', 'View Order Details & Timeline')}>
                        <IconButton
                          component={Link}
                          to={`/seller/orders/${o.id}`}
                          size="small"
                          sx={{ color: '#2563EB', bgcolor: '#EFF6FF', borderRadius: 2 }}
                        >
                          <MdVisibility size={18} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* 5. Reject Order Modal (Section 7.1.3 & Appendix A) */}
      <Dialog open={rejectModalOpen} onClose={() => setRejectModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#991B1B' }}>
          {t('farmer.rejectOrderTitle', 'Reject Incoming Order')}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="#475569" sx={{ mb: 2 }}>
            Rejecting will cancel Order #{selectedOrder?.order_number} and refund the buyer's locked escrow vault deposit.
          </Typography>

          <TextField
            select
            label="Reason for Rejection"
            fullWidth
            size="small"
            value={rejectReasonCode}
            onChange={(e) => setRejectReasonCode(e.target.value)}
            sx={{ mb: 2 }}
          >
            {REJECT_REASONS.map((r) => (
              <MenuItem key={r.code} value={r.code}>
                {r.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Additional Notes / Clarification"
            fullWidth
            size="small"
            multiline
            rows={3}
            placeholder="e.g. Current crop batch sold to local Mandi; next harvest ready in 10 days."
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRejectModalOpen(false)} sx={{ fontWeight: 600 }}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmReject} sx={{ fontWeight: 700 }}>
            {t('common.confirmReject', 'Confirm Rejection')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 6. Enter Dispatch Details Modal (Section 7.1.4) */}
      <Dialog open={dispatchModalOpen} onClose={() => setDispatchModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {t('farmer.dispatchModalTitle', 'Enter Transport & Dispatch Details')}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="#64748B" sx={{ mb: 2 }}>
            Order #{selectedOrder?.order_number} • Buyer: {selectedOrder?.buyer?.buyer_profile?.company_name || 'Buyer Enterprise'}
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
            <TextField
              select
              label="Dispatch Mode"
              size="small"
              value={dispatchMode}
              onChange={(e) => setDispatchMode(e.target.value)}
            >
              <MenuItem value="farmer_direct">Farmer Direct Transport (Tractor/Tempo)</MenuItem>
              <MenuItem value="buyer_pickup">Buyer Gate Pickup</MenuItem>
              <MenuItem value="logistics_truck">Logistics / Truck Load</MenuItem>
            </TextField>

            <TextField
              label="Vehicle Registration Number *"
              placeholder="e.g. GJ-03-AB-1234"
              size="small"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              required
            />

            <TextField
              label="Driver Name (Optional)"
              placeholder="e.g. Rajeshbhai Patel"
              size="small"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
            />

            <TextField
              label="Driver Mobile Number (Optional)"
              placeholder="e.g. 9876543210"
              size="small"
              value={driverPhone}
              onChange={(e) => setDriverPhone(e.target.value)}
            />

            <TextField
              label="Weighment Net Weight (Kg)"
              placeholder="e.g. 2000"
              size="small"
              type="number"
              value={weighmentKg}
              onChange={(e) => setWeighmentKg(e.target.value)}
            />

            <TextField
              label="Estimated Arrival (ETA Days)"
              size="small"
              type="number"
              value={etaDays}
              onChange={(e) => setEtaDays(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDispatchModalOpen(false)} sx={{ fontWeight: 600 }}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button variant="contained" color="primary" onClick={handleConfirmDispatch} sx={{ fontWeight: 700 }}>
            {t('farmer.confirmDispatch', 'Mark as Dispatched')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SellerOrders;
