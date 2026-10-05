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
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { MdCheckCircle, MdTimeline } from 'react-icons/md';
import { useGetBuyerOrdersQuery, useUpdateOrderStatusMutation } from '../../Api/Api';
import { toast } from 'react-toastify';

const orderSteps = ['Order Placed', 'Escrow Held', 'Accepted', 'Dispatched', 'Delivered & Released'];

const BuyerOrders = () => {
  const { data: ordersData, isLoading } = useGetBuyerOrdersQuery();
  const updateStatusMutation = useUpdateOrderStatusMutation();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);

  const orders = ordersData?.items || [];

  const handleConfirmDelivery = async (orderId) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        status: 'delivered',
        note: 'Buyer inspected produce and confirmed delivery. Escrow funds released to farmer.',
      });
      toast.success('Delivery confirmed! Payment successfully released to the farmer.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating status.');
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

  return (
    <Box>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight={800} color="#0F172A">
          📦 My Escrow Orders
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track real-time dispatch progress. Confirm delivery once goods arrive to release farmer payout.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAF9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Order #</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Farmer (Seller)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Produce Items</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Total Escrow (₹)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Current Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
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
                  <Typography color="text.secondary">No orders placed yet.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow key={o.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>#{o.order_number}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {o.seller?.seller_profile?.full_name || 'Farmer Seller'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {o.seller?.seller_profile?.district}, {o.seller?.seller_profile?.state}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {o.items?.map((item) => (
                      <Typography key={item.id} variant="body2">
                        {item.crop_name} ({item.variety}) • {item.quantity} {item.unit}
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>
                    ₹{(o.total_paise / 100).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={o.status.toUpperCase()}
                      size="small"
                      color={
                        o.status === 'completed' || o.status === 'delivered'
                          ? 'success'
                          : o.status === 'dispatched'
                          ? 'primary'
                          : 'warning'
                      }
                      sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                    />
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
                        Timeline
                      </Button>

                      {o.status === 'dispatched' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<MdCheckCircle />}
                          onClick={() => handleConfirmDelivery(o.id)}
                        >
                          Confirm & Release
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
          Order Tracking: #{selectedOrder?.order_number}
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
                Audit Log Timeline Events:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {selectedOrder.timeline?.map((event, idx) => (
                  <Box key={idx} sx={{ p: 1.5, bgcolor: '#F8FAF9', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" fontWeight={700} color="primary">
                        {event.status.toUpperCase()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(event.timestamp).toLocaleString()}
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
          <Button onClick={() => setTimelineModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BuyerOrders;
