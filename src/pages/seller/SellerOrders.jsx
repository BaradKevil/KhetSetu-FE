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
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { MdCheck, MdLocalShipping } from 'react-icons/md';
import { useGetSellerOrdersQuery, useUpdateOrderStatusMutation } from '../../Api/Api';
import { toast } from 'react-toastify';

const SellerOrders = () => {
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
      toast.success('Order accepted! Prepare harvest for dispatch.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error accepting order.');
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
      toast.success('Order marked as dispatched! Buyer notified.');
      setDispatchModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating dispatch.');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight={800} color="#0F172A">
          📦 Incoming Farmer Orders
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track buyer orders with locked escrow payment guarantees.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAF9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Order #</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Buyer Details</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Crops & Quantity</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Net Payout (Paise / ₹)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  Loading orders...
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
                <TableRow key={o.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>
                    #{o.order_number}
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {o.buyer?.buyer_profile?.company_name || 'Buyer Enterprise'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {o.delivery_address?.city}, {o.delivery_address?.state}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {o.items?.map((item) => (
                      <Typography key={item.id} variant="body2">
                        {item.crop_name} ({item.variety}) • {item.quantity} {item.unit}
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#2E7D32' }}>
                    ₹{(o.payout_paise / 100).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={o.status.toUpperCase()}
                      size="small"
                      color={
                        o.status === 'completed'
                          ? 'success'
                          : o.status === 'escrow_held'
                          ? 'warning'
                          : 'primary'
                      }
                      sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {o.status === 'escrow_held' && (
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        startIcon={<MdCheck />}
                        onClick={() => handleAcceptOrder(o.id)}
                        sx={{ borderRadius: 2 }}
                      >
                        Accept
                      </Button>
                    )}
                    {o.status === 'accepted' && (
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        startIcon={<MdLocalShipping />}
                        onClick={() => handleOpenDispatch(o)}
                        sx={{ borderRadius: 2 }}
                      >
                        Dispatch
                      </Button>
                    )}
                    {o.status === 'dispatched' && (
                      <Typography variant="caption" color="text.secondary">
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
