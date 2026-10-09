import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Button,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MdArrowBack,
  MdCheckCircle,
  MdSecurity,
  MdPrint,
  MdReportProblem,
  MdLocalShipping,
  MdAgriculture,
  MdLocationOn,
  MdVpnKey,
} from 'react-icons/md';
import { useGetOrderDetailsQuery, useUpdateOrderStatusMutation } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';

const BuyerOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, formatCurrency, formatDate } = useLanguage();
  const { data: order, isLoading } = useGetOrderDetailsQuery(id);
  const updateStatusMutation = useUpdateOrderStatusMutation();

  if (isLoading) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  if (!order || !id || id === 'undefined') {
    return (
      <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3.5 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {id && id !== 'undefined' ? `Order #${id} Not Found` : 'Order Details Unavailable'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please select an order from your Escrow Orders list to view full tracking and inspection details.
        </Typography>
        <Button component={Link} to="/buyer/orders" startIcon={<MdArrowBack />} variant="contained">
          Back to Orders
        </Button>
      </Paper>
    );
  }

  const handleConfirmDelivery = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        id: order.id,
        status: 'delivered',
        note: 'Buyer inspected produce at godown and confirmed satisfactory quality. Escrow funds released to farmer.',
      });
      toast.success('Delivery accepted! Escrow payment successfully released to farmer.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating status');
    }
  };

  const steps = [
    'Order Placed',
    'Escrow Secured',
    'Seller Confirmed',
    'Dispatched',
    'Delivered & Inspected',
  ];

  const getStepIndex = (status) => {
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

  const activeStep = getStepIndex(order.status);
  const seller = order.seller;
  const sellerProfile = seller?.seller_profile;
  const items = order.items || [];
  const dispatch = order.dispatch_details || {};
  const deliveryAddress = order.delivery_address || {};

  // Synthetic delivery OTP for verification handshake
  const deliveryOtp = order.order_number ? String(order.id * 137).slice(-4).padStart(4, '8') : '4291';

  return (
    <Box maxWidth="lg" sx={{ mx: 'auto' }}>
      {/* Top Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Button component={Link} to="/buyer/orders" startIcon={<MdArrowBack />} color="inherit" sx={{ fontWeight: 600 }}>
          Back to My Orders
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<MdPrint />}
          onClick={() => window.print()}
          sx={{ borderRadius: 2 }}
        >
          Print Escrow Invoice
        </Button>
      </Box>

      {/* Order Header Card */}
      <Paper elevation={0} sx={{ p: 3.5, mb: 3.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h4" fontWeight={800} color="#0F172A">
                Order #{order.order_number}
              </Typography>
              <Chip
                label={order.status?.toUpperCase()?.replace('_', ' ')}
                color={
                  ['delivered', 'completed'].includes(order.status)
                    ? 'success'
                    : order.status === 'disputed'
                    ? 'error'
                    : 'primary'
                }
                sx={{ fontWeight: 800 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Placed on {formatDate(order.created_at)} • Payment via {order.payment_method || 'Escrow Vault'}
            </Typography>
          </Box>

          <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Typography variant="caption" color="text.secondary">
              Total Escrow Protected Hold
            </Typography>
            <Typography variant="h4" fontWeight={800} color="#2E7D32">
              {formatCurrency(order.total_paise, true)}
            </Typography>
          </Box>
        </Box>

        {/* Stepper Timeline */}
        <Box sx={{ py: 2, px: { xs: 0, sm: 2 } }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label} completed={activeStep > index || ['delivered', 'completed'].includes(order.status)}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Paper>

      {/* 48-Hour Inspection Action Card */}
      {['dispatched', 'delivered'].includes(order.status) && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3.5,
            borderRadius: 3.5,
            border: '2px solid #86EFAC',
            bgcolor: '#F0FDF4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MdSecurity size={24} color="#16A34A" />
              <Typography variant="subtitle1" fontWeight={800} color="#15803D">
                48-Hour Quality Inspection Window Active
              </Typography>
            </Box>
            <Typography variant="body2" color="#166534" sx={{ mt: 0.5, maxWidth: 620 }}>
              Inspect weight, moisture, and grain grade upon delivery. Confirm below to release payment to the farmer, or raise a dispute if goods differ from specifications.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<MdCheckCircle />}
              onClick={handleConfirmDelivery}
              disabled={updateStatusMutation.isPending || order.status === 'delivered'}
              sx={{ fontWeight: 800, borderRadius: 2.5, px: 3 }}
            >
              {order.status === 'delivered' ? 'Delivery Accepted' : 'Inspect & Confirm Delivery'}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<MdReportProblem />}
              onClick={() => navigate(`/buyer/disputes?order_id=${order.id}`)}
              sx={{ fontWeight: 700, borderRadius: 2.5 }}
            >
              Raise Dispute / Issue
            </Button>
          </Box>
        </Paper>
      )}

      {order.status === 'disputed' && (
        <Alert severity="error" icon={<MdReportProblem size={22} />} sx={{ mb: 3.5, borderRadius: 2.5 }}>
          <strong>Dispute Under Platform Review:</strong> An issue was raised regarding this batch. Payout to the seller is paused while administrative arbitration examines evidence.
        </Alert>
      )}

      <Grid container spacing={3.5}>
        {/* Left Column: Items and Logistics */}
        <Grid item xs={12} md={7} size={{ xs: 12, md: 7 }}>
          {/* Produce Items */}
          <Paper elevation={0} sx={{ p: 3, mb: 3.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Typography variant="subtitle1" fontWeight={800} color="#0F172A" sx={{ mb: 2 }}>
              Produce Items in this Escrow Order
            </Typography>

            <Table size="small">
              <TableHead sx={{ bgcolor: '#F8FAF9' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Produce</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Grade</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Rate</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {it.variety}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {it.crop_name}
                      </Typography>
                    </TableCell>
                    <TableCell>{it.grade || 'FAQ'}</TableCell>
                    <TableCell>{it.quantity} {it.unit}</TableCell>
                    <TableCell>{formatCurrency(it.price_per_unit_paise, true)}/{it.unit}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                      {formatCurrency(it.subtotal_paise, true)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          {/* Logistics & Dispatch Card */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <MdLocalShipping color="#2563EB" size={22} />
              <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                Logistics & Dispatch Information
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6} size={6}>
                <Typography variant="caption" color="text.secondary">Transporter / Carrier:</Typography>
                <Typography variant="body2" fontWeight={700}>{dispatch.carrier_name || 'Direct Farm Transport'}</Typography>
              </Grid>
              <Grid item xs={6} size={6}>
                <Typography variant="caption" color="text.secondary">Vehicle / Truck Number:</Typography>
                <Typography variant="body2" fontWeight={700}>{dispatch.vehicle_number || 'GJ-03-BW-7821'}</Typography>
              </Grid>
              <Grid item xs={6} size={6}>
                <Typography variant="caption" color="text.secondary">Tracking Number:</Typography>
                <Typography variant="body2" fontWeight={700}>{dispatch.tracking_number || `TRK-${order.order_number}`}</Typography>
              </Grid>
              <Grid item xs={6} size={6}>
                <Typography variant="caption" color="text.secondary">Delivery Handshake OTP:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                  <MdVpnKey color="#D97706" size={16} />
                  <Typography variant="body1" fontWeight={800} color="#D97706" sx={{ letterSpacing: 2 }}>
                    {deliveryOtp}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Right Column: Financial Breakdown & Contacts */}
        <Grid item xs={12} md={5} size={{ xs: 12, md: 5 }}>
          {/* Financial Breakdown */}
          <Paper elevation={0} sx={{ p: 3, mb: 3.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Typography variant="subtitle1" fontWeight={800} color="#0F172A" gutterBottom>
              Escrow Financial Ledger
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1.5 }}>
              <Typography variant="body2" color="text.secondary">Produce Subtotal:</Typography>
              <Typography variant="body2" fontWeight={700}>{formatCurrency(order.subtotal_paise, true)}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">Platform Escrow Fee (0.5%):</Typography>
              <Typography variant="body2" fontWeight={700}>{formatCurrency(order.buyer_fee_paise, true)}</Typography>
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={800}>Total Held in Vault:</Typography>
              <Typography variant="h6" fontWeight={800} color="#2E7D32">
                {formatCurrency(order.total_paise, true)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">Farmer Settlement Payout:</Typography>
              <Typography variant="caption" fontWeight={700}>
                {formatCurrency(order.payout_paise, true)}
              </Typography>
            </Box>
          </Paper>

          {/* Farmer & Delivery Contact Cards */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <MdAgriculture color="#2E7D32" size={20} />
              <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                Farmer Producer Details
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={700}>
              {sellerProfile?.full_name || 'Farmer Producer'}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              🌾 {sellerProfile?.farm_name || 'Farm Godown'}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              📍 {sellerProfile?.district}, {sellerProfile?.state}
            </Typography>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <MdLocationOn color="#2563EB" size={20} />
              <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                Delivery Destination
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={700}>
              {deliveryAddress.recipient_name || 'Warehouse Manager'} ({deliveryAddress.phone || ''})
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {deliveryAddress.address_line}, {deliveryAddress.city ? deliveryAddress.city + ', ' : ''}
              {deliveryAddress.district}, {deliveryAddress.state} - {deliveryAddress.pincode}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BuyerOrderDetail;
