import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Chip,
  IconButton,
} from '@mui/material';
import {
  MdArrowBack,
  MdCheck,
  MdClose,
  MdLocalShipping,
  MdVerified,
  MdPerson,
  MdLocationOn,
  MdPhone,
  MdInventory2,
  MdAccessTime,
  MdDoneAll,
} from 'react-icons/md';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetOrderDetailsQuery, useUpdateOrderStatusMutation } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';
import StatusBadge from '../../common/custom/StatusBadge';
import FeeBreakdown from '../../common/custom/FeeBreakdown';
import PayoutTimeline from '../../common/custom/PayoutTimeline';
import { formatINR, formatQty, formatIST, REJECT_REASONS } from '../../common/status';

const SellerOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const { data: order, isLoading } = useGetOrderDetailsQuery(id);
  const updateStatusMutation = useUpdateOrderStatusMutation();

  // Reject Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReasonCode, setRejectReasonCode] = useState('OUT_OF_STOCK');
  const [rejectNote, setRejectNote] = useState('');

  // Dispatch Modal
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchMode, setDispatchMode] = useState('farmer_direct');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [weighmentKg, setWeighmentKg] = useState('');
  const [etaDays, setEtaDays] = useState('2');

  if (isLoading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          {t('common.loading', 'Loading order details...')}
        </Typography>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Order not found
        </Typography>
        <Button onClick={() => navigate('/seller/orders')} sx={{ mt: 2 }} variant="outlined">
          Back to Orders
        </Button>
      </Box>
    );
  }

  const handleAccept = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        id: order.id,
        status: 'accepted',
        note: 'Order accepted by farmer. Packing harvest lot for dispatch.',
      });
      toast.success(t('farmer.orderAccepted', 'Order accepted! Please prepare harvest for dispatch.'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error accepting order');
    }
  };

  const handleConfirmReject = async () => {
    try {
      const selectedReason = REJECT_REASONS.find((r) => r.code === rejectReasonCode)?.label || rejectReasonCode;
      const fullReason = `${selectedReason}${rejectNote ? ` - ${rejectNote}` : ''}`;

      await updateStatusMutation.mutateAsync({
        id: order.id,
        status: 'cancelled',
        note: fullReason,
        cancelled_reason: fullReason,
      });
      toast.info('Order rejected. Payment refunded to buyer.');
      setRejectModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error rejecting order');
    }
  };

  const handleConfirmDispatch = async () => {
    if (!vehicleNumber.trim()) {
      toast.warning('Please enter vehicle registration number (e.g. GJ-03-AB-1234)');
      return;
    }
    try {
      await updateStatusMutation.mutateAsync({
        id: order.id,
        status: 'dispatched',
        note: `Dispatched via vehicle ${vehicleNumber}. Driver: ${driverName || 'Self'}.`,
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
      toast.success('Order marked as dispatched!');
      setDispatchModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error marking dispatched');
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* 1. Header with Breadcrumb & Status */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            onClick={() => navigate('/seller/orders')}
            size="small"
            sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 2 }}
          >
            <MdArrowBack />
          </IconButton>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h5" fontWeight={800} color="#0F172A">
                Order #{order.order_number}
              </Typography>
              <StatusBadge status={order.status} role="farmer" />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Placed on {formatIST(order.created_at)} • Escrow Transaction Secured
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons in Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {order.status === 'escrow_held' && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<MdCheck />}
                onClick={handleAccept}
                sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
              >
                Accept Order
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<MdClose />}
                onClick={() => setRejectModalOpen(true)}
                sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
              >
                Reject
              </Button>
            </>
          )}

          {order.status === 'accepted' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<MdLocalShipping />}
              onClick={() => {
                setVehicleNumber('');
                setDriverName('');
                setDriverPhone('');
                setWeighmentKg(order.items?.[0]?.quantity ? String(order.items[0].quantity * 100) : '');
                setDispatchModalOpen(true);
              }}
              sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
            >
              Enter Dispatch Details
            </Button>
          )}
        </Box>
      </Box>

      {/* SLA Alert Banner */}
      {order.status === 'escrow_held' && (
        <Alert severity="warning" icon={<MdAccessTime />} sx={{ mb: 3, borderRadius: 2.5, fontWeight: 600 }}>
          {t(
            'farmer.acceptDeadlineAlert',
            'Action Required: Please accept this purchase order within 12 hours to confirm your crop harvest readiness and prevent automatic refund.'
          )}
        </Alert>
      )}

      {/* 2. Main Two-Column Layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, alignItems: 'start' }}>
        {/* Left Column: Order Items, Dispatch Details, Delivery Address */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Order Items Card */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Typography variant="subtitle1" fontWeight={800} color="#0F172A" sx={{ mb: 2 }}>
              Ordered Agricultural Produce
            </Typography>

            {order.items?.map((item) => (
              <Box
                key={item.id}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: '#F8FAFC',
                  border: '1px solid #F1F5F9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2.5,
                      bgcolor: '#DCFCE7',
                      color: '#166534',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                    }}
                  >
                    <MdInventory2 />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                      {item.crop_name} ({item.variety || 'Standard Quality'})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Grade {item.grade || 'A'} • Unit: {item.unit || 'Quintal'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                  <Typography variant="body2" fontWeight={700} color="#334155">
                    {formatQty(item.quantity, item.unit || 'Quintal', language)} ×{' '}
                    {formatINR(item.price_per_unit_paise, true, language)}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} color="#2563EB">
                    {formatINR(item.subtotal_paise, true, language)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>

          {/* Dispatch & Logistics Details Card */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                Transport & Dispatch Documentation
              </Typography>
              {order.dispatch_details?.vehicle_number && (
                <Chip
                  icon={<MdLocalShipping size={14} />}
                  label={order.dispatch_details.vehicle_number}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 700, borderRadius: 1.5 }}
                />
              )}
            </Box>

            {order.dispatch_details ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Transport Mode
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="#0F172A">
                    {order.dispatch_details.mode?.replace(/_/g, ' ').toUpperCase() || 'FARMER DIRECT'}
                  </Typography>
                </Box>

                <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Vehicle Registration #
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="#0F172A">
                    {order.dispatch_details.vehicle_number || 'N/A'}
                  </Typography>
                </Box>

                <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Driver Contact
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="#0F172A">
                    {order.dispatch_details.driver_name || 'Assigned Driver'}{' '}
                    {order.dispatch_details.driver_phone ? `(${order.dispatch_details.driver_phone})` : ''}
                  </Typography>
                </Box>

                <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Dispatched On
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="#0F172A">
                    {formatIST(order.dispatch_details.dispatch_date)}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Dispatch details will be documented once you confirm vehicle readiness.
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Delivery & Destination Address */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <MdLocationOn size={22} color="#2563EB" />
              <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                Buyer Delivery Destination
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={600} color="#334155">
              {order.delivery_address?.recipient_name || 'Buyer Agro Godown'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.delivery_address?.address_line}, {order.delivery_address?.city}, {order.delivery_address?.district}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {order.delivery_address?.state} – PIN: {order.delivery_address?.pincode}
            </Typography>
          </Paper>
        </Box>

        {/* Right Column: Fee Breakdown, Payout Timeline & Buyer Card */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Transparent Fee Breakdown */}
          <FeeBreakdown
            subtotalPaise={order.subtotal_paise}
            orderPricing={{
              subtotalPaise: order.subtotal_paise,
              commissionPaise: order.commission_paise,
              buyerFeePaise: order.buyer_fee_paise,
              sellerNetPayoutPaise: order.payout_paise,
              buyerTotalEscrowPaise: order.total_paise,
            }}
          />

          {/* Lifecycle & Payout Timeline */}
          <PayoutTimeline order={order} />

          {/* Buyer Enterprise Profile Card */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 1.5 }}>
              Verified Buyer Details
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                }}
              >
                <MdPerson />
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                  {order.buyer?.buyer_profile?.company_name || 'Agro Trading Enterprise'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <MdVerified size={14} color="#16A34A" />
                  <Typography variant="caption" fontWeight={700} color="#16A34A">
                    Verified Buyer • 100% Escrow Funded
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Contact coordinates are masked under KhetSetu trade privacy rules until harvest delivery.
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Reject Order Modal */}
      <Dialog open={rejectModalOpen} onClose={() => setRejectModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#991B1B' }}>Reject Incoming Order</DialogTitle>
        <DialogContent dividers>
          <TextField
            select
            label="Reason for Rejection"
            fullWidth
            size="small"
            value={rejectReasonCode}
            onChange={(e) => setRejectReasonCode(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
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
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRejectModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmReject} sx={{ fontWeight: 700 }}>
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dispatch Modal */}
      <Dialog open={dispatchModalOpen} onClose={() => setDispatchModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Enter Transport & Dispatch Details</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
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
              label="Driver Name"
              placeholder="e.g. Rajeshbhai Patel"
              size="small"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
            />

            <TextField
              label="Driver Mobile"
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
          <Button onClick={() => setDispatchModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleConfirmDispatch} sx={{ fontWeight: 700 }}>
            Mark as Dispatched
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SellerOrderDetail;
