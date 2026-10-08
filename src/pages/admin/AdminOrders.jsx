import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Divider,
  Tabs,
  Tab,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  MdSearch,
  MdFilterList,
  MdVisibility,
  MdLock,
  MdLocalShipping,
  MdCancel,
  MdCheckCircle,
  MdRefresh,
  MdWarning,
  MdFileDownload,
  MdGavel,
} from 'react-icons/md';
import { useGetAdminOrdersQuery, useOrderInterventionMutation } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';

const formatINR = (val) => {
  const num = Number(val) || 0;
  return '₹' + num.toLocaleString('en-IN');
};

const getStatusChip = (status) => {
  switch (status) {
    case 'paid':
      return <Chip label="ESCROW SECURED" size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '0.72rem' }} />;
    case 'in_transit':
    case 'shipped':
      return <Chip label="IN TRANSIT" size="small" sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 800, fontSize: '0.72rem' }} />;
    case 'delivered':
      return <Chip label="DELIVERED (48H SLA)" size="small" sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 800, fontSize: '0.72rem' }} />;
    case 'completed':
      return <Chip label="COMPLETED & PAID" size="small" sx={{ bgcolor: '#E2E8F0', color: '#334155', fontWeight: 800, fontSize: '0.72rem' }} />;
    case 'disputed':
      return <Chip label="⚠️ DISPUTED" size="small" sx={{ bgcolor: '#FEE2E2', color: '#991B1B', fontWeight: 800, fontSize: '0.72rem' }} />;
    case 'cancelled':
    case 'refunded':
      return <Chip label="REFUNDED / CANCELLED" size="small" sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 800, fontSize: '0.72rem' }} />;
    case 'pending_escrow':
    default:
      return <Chip label="PENDING PAYMENT" size="small" sx={{ bgcolor: '#FFFBEB', color: '#B45309', fontWeight: 800, fontSize: '0.72rem' }} />;
  }
};

const AdminOrders = () => {
  const { formatDate } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [interventionAction, setInterventionAction] = useState(''); // 'freeze_escrow' | 'manual_mark_delivered' | 'force_cancel'
  const [interventionReason, setInterventionReason] = useState('');

  const { data: ordersData, isLoading, refetch } = useGetAdminOrdersQuery({
    search: searchTerm || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    limit: 50,
  });

  const interventionMutation = useOrderInterventionMutation();

  const orders = Array.isArray(ordersData) ? ordersData : ordersData?.data || [];

  const handleExecuteIntervention = async () => {
    if (!selectedOrder || !interventionAction) return;
    if (!interventionReason.trim()) {
      toast.error('An administrative reason is mandatory for all escrow interventions.');
      return;
    }

    try {
      await interventionMutation.mutateAsync({
        id: selectedOrder.id,
        action: interventionAction,
        reason: interventionReason,
      });
      toast.success(`Order intervention "${interventionAction.replace(/_/g, ' ')}" executed successfully.`);
      setSelectedOrder(null);
      setInterventionAction('');
      setInterventionReason('');
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to execute intervention.');
    }
  };

  const exportOrdersCSV = () => {
    if (!orders.length) {
      toast.info('No orders to export.');
      return;
    }
    const headers = [
      'Order ID',
      'Order Number',
      'Date',
      'Buyer Name',
      'Buyer Phone',
      'Seller Name',
      'Seller Phone',
      'Product',
      'Quantity',
      'Unit',
      'Total Amount',
      'Platform Fee',
      'Seller Net',
      'Status',
    ];

    const rows = orders.map((o) => {
      const gross = Number(o.total_price || o.total_amount || 0);
      const fee = Number(o.platform_fee || Math.round(gross * 0.03));
      const sellerNet = Number(o.seller_amount || (gross - fee));
      return [
        o.id,
        o.order_number || `ORD-${o.id}`,
        new Date(o.createdAt || o.created_at).toISOString(),
        `"${o.buyer?.full_name || o.buyer?.name || 'Buyer'}"`,
        `"${o.buyer?.phone || ''}"`,
        `"${o.seller?.full_name || o.seller?.farm_name || 'Farmer'}"`,
        `"${o.seller?.phone || ''}"`,
        `"${o.product?.crop_name || o.product?.title || 'Agri Commodity'}"`,
        o.quantity || 1,
        o.unit || 'kg',
        gross,
        fee,
        sellerNet,
        o.status,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `khetsetu_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 } }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#0F172A">
            Orders Oversight & Escrow Vault
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cross-marketplace view of all crop procurement contracts, logistics tracking, and dispute intervention.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<MdFileDownload />}
            onClick={exportOrdersCSV}
            sx={{ fontWeight: 700 }}
          >
            Export CSV
          </Button>
          <IconButton onClick={() => refetch()} sx={{ bgcolor: '#F1F5F9' }}>
            <MdRefresh />
          </IconButton>
        </Box>
      </Box>

      {/* Filter and Search Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5} size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by Order ID, Buyer, Farmer or Crop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MdSearch color="#94A3B8" size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={7} size={{ xs: 12, md: 7 }}>
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: { xs: 1, md: 0 } }}>
              {[
                { label: 'All Orders', val: 'all' },
                { label: 'Escrow Secured', val: 'paid' },
                { label: 'In Transit', val: 'in_transit' },
                { label: 'Delivered', val: 'delivered' },
                { label: 'Completed', val: 'completed' },
                { label: 'Disputed', val: 'disputed' },
                { label: 'Cancelled', val: 'cancelled' },
              ].map((tab) => (
                <Chip
                  key={tab.val}
                  label={tab.label}
                  clickable
                  color={statusFilter === tab.val ? 'primary' : 'default'}
                  variant={statusFilter === tab.val ? 'filled' : 'outlined'}
                  onClick={() => setStatusFilter(tab.val)}
                  sx={{ fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Orders Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>ORDER #</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>BUYER</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>FARMER (SELLER)</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>COMMODITY</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>AMOUNT & FEES</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>DATE (IST)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#2E7D32' }} />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" fontWeight={600} color="text.secondary">
                      No purchase orders match this filter.
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Live procurement transactions across all buyers and farmers will appear here.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const gross = Number(order.total_price || order.total_amount || 0);
                  const fee = Number(order.platform_fee || Math.round(gross * 0.03));
                  const sellerNet = Number(order.seller_amount || (gross - fee));

                  return (
                    <TableRow key={order.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={800} color="#0F172A">
                          {order.order_number || `ORD-${order.id}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: #{order.id}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="#0F172A">
                          {order.buyer?.full_name || order.buyer?.name || 'Buyer User'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.buyer?.phone || 'No phone'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="#0F172A">
                          {order.seller?.full_name || order.seller?.farm_name || 'Farmer'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.seller?.phone || 'No phone'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="#0F172A">
                          {order.product?.crop_name || order.product?.title || 'Agri Produce'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.quantity} {order.unit || 'kg'} • {formatINR(order.unit_price || Math.round(gross / (order.quantity || 1)))}/{order.unit || 'kg'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={800} color="#0F172A">
                          {formatINR(gross)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Fee: {formatINR(fee)} • Net: {formatINR(sellerNet)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {getStatusChip(order.status)}
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="#334155">
                          {formatDate(order.createdAt || order.created_at, true)}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<MdVisibility />}
                          onClick={() => {
                            setSelectedOrder(order);
                            setInterventionAction('');
                            setInterventionReason('');
                          }}
                          sx={{ fontWeight: 700 }}
                        >
                          Inspect
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Order Inspection & Intervention Dialog */}
      <Dialog
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        {selectedOrder && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight={800} color="#0F172A">
                  Order Inspection: {selectedOrder.order_number || `ORD-${selectedOrder.id}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Created on: {formatDate(selectedOrder.createdAt || selectedOrder.created_at, true)} • Contract ID: #{selectedOrder.id}
                </Typography>
              </Box>
              {getStatusChip(selectedOrder.status)}
            </DialogTitle>

            <DialogContent dividers>
              {/* Financial Breakdown Card */}
              <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2.5, bgcolor: '#F8FAF9', border: '1px solid #E2E8F0' }}>
                <Typography variant="subtitle2" fontWeight={800} color="#166534" sx={{ mb: 1.5 }}>
                  💰 ESCROW LEDGER BREAKDOWN
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3} size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">Gross Buyer Paid</Typography>
                    <Typography variant="h6" fontWeight={800} color="#0F172A">
                      {formatINR(selectedOrder.total_price || selectedOrder.total_amount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">KhetSetu 3% Commission</Typography>
                    <Typography variant="h6" fontWeight={800} color="#059669">
                      {formatINR(selectedOrder.platform_fee || Math.round(Number(selectedOrder.total_price || selectedOrder.total_amount || 0) * 0.03))}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">Farmer Net Payable</Typography>
                    <Typography variant="h6" fontWeight={800} color="#2563EB">
                      {formatINR(selectedOrder.seller_amount || (Number(selectedOrder.total_price || 0) - Math.round(Number(selectedOrder.total_price || 0) * 0.03)))}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">Escrow Hold Status</Typography>
                    <Typography variant="subtitle1" fontWeight={800} color={selectedOrder.status === 'completed' ? '#16A34A' : '#D97706'}>
                      {selectedOrder.status === 'completed' ? 'SETTLED' : 'LOCKED IN VAULT'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Parties and Commodity Details */}
              <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #E2E8F0', height: '100%' }}>
                    <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 1 }}>
                      👤 Buyer Information
                    </Typography>
                    <Typography variant="body2"><strong>Name:</strong> {selectedOrder.buyer?.full_name || selectedOrder.buyer?.name || 'Buyer'}</Typography>
                    <Typography variant="body2"><strong>Phone:</strong> {selectedOrder.buyer?.phone || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Email:</strong> {selectedOrder.buyer?.email || 'N/A'}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}><strong>Delivery Address:</strong> {selectedOrder.delivery_address || selectedOrder.shipping_address || 'Standard Registered Business Location'}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #E2E8F0', height: '100%' }}>
                    <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 1 }}>
                      🌾 Farmer / Seller Details
                    </Typography>
                    <Typography variant="body2"><strong>Farmer:</strong> {selectedOrder.seller?.full_name || selectedOrder.seller?.farm_name || 'Farmer'}</Typography>
                    <Typography variant="body2"><strong>Phone:</strong> {selectedOrder.seller?.phone || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Commodity:</strong> {selectedOrder.product?.crop_name || selectedOrder.product?.title}</Typography>
                    <Typography variant="body2"><strong>Contract Volume:</strong> {selectedOrder.quantity} {selectedOrder.unit || 'kg'}</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Administrative Intervention Zone */}
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '2px solid #FEE2E2', bgcolor: '#FFF5F5' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <MdGavel size={22} color="#DC2626" />
                  <Typography variant="subtitle2" fontWeight={800} color="#991B1B">
                    SUPER ADMIN INTERVENTION TOOLS
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Interventions directly impact escrow hold accounts and are permanently logged in the immutable double-entry audit trail.
                </Typography>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
                    <Button
                      fullWidth
                      variant={interventionAction === 'freeze_escrow' ? 'contained' : 'outlined'}
                      color="warning"
                      startIcon={<MdLock />}
                      onClick={() => setInterventionAction('freeze_escrow')}
                      sx={{ fontWeight: 700 }}
                    >
                      Freeze Escrow
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
                    <Button
                      fullWidth
                      variant={interventionAction === 'manual_mark_delivered' ? 'contained' : 'outlined'}
                      color="info"
                      startIcon={<MdLocalShipping />}
                      onClick={() => setInterventionAction('manual_mark_delivered')}
                      sx={{ fontWeight: 700 }}
                    >
                      Force Mark Delivered
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
                    <Button
                      fullWidth
                      variant={interventionAction === 'force_cancel' ? 'contained' : 'outlined'}
                      color="error"
                      startIcon={<MdCancel />}
                      onClick={() => setInterventionAction('force_cancel')}
                      sx={{ fontWeight: 700 }}
                    >
                      Force Cancel & Refund
                    </Button>
                  </Grid>
                </Grid>

                {interventionAction && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label={`Mandatory Reason for "${interventionAction.replace(/_/g, ' ').toUpperCase()}"`}
                      placeholder="Explain the legal or operational rationale for this escrow override..."
                      value={interventionReason}
                      onChange={(e) => setInterventionReason(e.target.value)}
                      required
                    />
                  </Box>
                )}
              </Paper>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setSelectedOrder(null)} sx={{ fontWeight: 700 }}>
                Close
              </Button>
              {interventionAction && (
                <Button
                  variant="contained"
                  color={interventionAction === 'force_cancel' ? 'error' : interventionAction === 'freeze_escrow' ? 'warning' : 'primary'}
                  onClick={handleExecuteIntervention}
                  disabled={interventionMutation.isPending || !interventionReason.trim()}
                  sx={{ fontWeight: 700, px: 3 }}
                >
                  {interventionMutation.isPending ? 'Executing...' : 'Confirm Intervention'}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AdminOrders;
