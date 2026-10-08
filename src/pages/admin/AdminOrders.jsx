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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Grid,
  Tabs,
  Tab,
  InputAdornment,
  TablePagination,
  TableSortLabel,
} from '@mui/material';
import {
  MdSearch,
  MdVisibility,
  MdLock,
  MdLocalShipping,
  MdCancel,
  MdFileDownload,
  MdGavel,
  MdReceiptLong,
  MdHourglassTop,
  MdDoneAll,
  MdWarning,
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
    case 'escrow_held':
      return <Chip label="ESCROW SECURED" size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: '0.72rem' }} />;
    case 'in_transit':
    case 'shipped':
    case 'dispatched':
    case 'accepted':
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

  // Search & Tab States
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Sorting & Pagination States (handled by backend)
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Inspection & Intervention State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [interventionAction, setInterventionAction] = useState(''); // 'freeze_escrow' | 'manual_mark_delivered' | 'force_cancel'
  const [interventionReason, setInterventionReason] = useState('');

  // Fetch orders with server-side query params
  const { data: ordersData, isLoading, refetch } = useGetAdminOrdersQuery({
    search: searchTerm.trim() || undefined,
    status: activeTab !== 'all' ? activeTab : undefined,
    sortBy,
    sortOrder,
    page,
    limit: rowsPerPage,
  });

  const interventionMutation = useOrderInterventionMutation();

  const orders = ordersData?.items || ordersData?.data || (Array.isArray(ordersData) ? ordersData : []);
  const pagination = ordersData?.pagination || {
    currentPage: page,
    totalPages: Math.ceil(orders.length / rowsPerPage) || 1,
    totalCount: orders.length,
    limit: rowsPerPage,
  };
  const counts = ordersData?.counts || {};

  const handleTabChange = (_event, newValue) => {
    setActiveTab(newValue);
    setPage(1);
  };

  const handleSort = (property) => {
    const isAsc = sortBy === property && sortOrder === 'ASC';
    setSortOrder(isAsc ? 'DESC' : 'ASC');
    setSortBy(property);
    setPage(1);
  };

  const handleChangePage = (_event, newPage) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

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
        new Date(o.createdAt || o.created_at || Date.now()).toISOString(),
        `"${o.buyer?.full_name || o.buyer?.buyer_profile?.company_name || o.buyer?.name || 'Buyer'}"`,
        `"${o.buyer?.phone || ''}"`,
        `"${o.seller?.full_name || o.seller?.seller_profile?.full_name || o.seller?.farm_name || 'Farmer'}"`,
        `"${o.seller?.phone || ''}"`,
        `"${o.items?.[0]?.product?.crop?.name_en || o.product?.crop_name || o.product?.variety || 'Agri Commodity'}"`,
        o.quantity || o.items?.[0]?.quantity || 1,
        o.unit || o.items?.[0]?.unit || 'kg',
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
    link.setAttribute('download', `khetsetu_orders_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Page Header */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5" fontWeight={800} color="#0F172A">
          Orders Oversight & Escrow Vault
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cross-marketplace view of all crop procurement contracts, logistics tracking, and dispute intervention.
        </Typography>
      </Box>

      {/* Top Controls: Search Bar on Left + Export Button on Far Right (Refresh removed) */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: 3,
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: { xs: '100%', sm: 320 } }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by Order ID, Buyer, Farmer or Crop..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MdSearch size={20} color="#64748B" />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 460 }}
          />
        </Box>

        <Button
          variant="contained"
          startIcon={<MdFileDownload size={18} />}
          onClick={exportOrdersCSV}
          sx={{
            fontWeight: 700,
            bgcolor: '#166534',
            '&:hover': { bgcolor: '#14532D' },
            borderRadius: 2,
            px: 2.5,
            py: 0.9,
            textTransform: 'none',
          }}
        >
          Export Orders CSV
        </Button>
      </Paper>

      {/* Distinct Tabs Row Below Controls with Count Badges */}
      <Box sx={{ borderBottom: 1, borderColor: '#E2E8F0', mb: 2.5 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 700,
              fontSize: '0.9rem',
              textTransform: 'none',
              minHeight: 48,
              px: { xs: 2, sm: 2.8 },
            },
          }}
        >
          <Tab
            value="all"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdReceiptLong size={18} />
                <span>All Orders</span>
                {counts.all !== undefined && (
                  <Chip
                    label={counts.all}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      bgcolor: activeTab === 'all' ? '#DCFCE7' : '#F1F5F9',
                      color: activeTab === 'all' ? '#15803D' : '#64748B',
                    }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            value="paid"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdLock size={17} />
                <span>Escrow Secured</span>
                {(counts.paid !== undefined || counts.escrow_held !== undefined) && (
                  <Chip
                    label={counts.paid ?? counts.escrow_held}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      bgcolor: activeTab === 'paid' ? '#DCFCE7' : '#F1F5F9',
                      color: activeTab === 'paid' ? '#15803D' : '#64748B',
                    }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            value="in_transit"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdLocalShipping size={18} />
                <span>In Transit</span>
                {counts.in_transit !== undefined && (
                  <Chip
                    label={counts.in_transit}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      bgcolor: activeTab === 'in_transit' ? '#E0F2FE' : '#F1F5F9',
                      color: activeTab === 'in_transit' ? '#0369A1' : '#64748B',
                    }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            value="delivered"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdHourglassTop size={18} />
                <span>Delivered</span>
                {counts.delivered !== undefined && (
                  <Chip
                    label={counts.delivered}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      bgcolor: activeTab === 'delivered' ? '#FEF3C7' : '#F1F5F9',
                      color: activeTab === 'delivered' ? '#92400E' : '#64748B',
                    }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            value="completed"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdDoneAll size={18} />
                <span>Completed</span>
                {counts.completed !== undefined && (
                  <Chip
                    label={counts.completed}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      bgcolor: activeTab === 'completed' ? '#DCFCE7' : '#F1F5F9',
                      color: activeTab === 'completed' ? '#15803D' : '#64748B',
                    }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            value="disputed"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdWarning size={17} />
                <span>Disputed</span>
                {counts.disputed !== undefined && (
                  <Chip
                    label={counts.disputed}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      bgcolor: activeTab === 'disputed' ? '#FEE2E2' : '#F1F5F9',
                      color: activeTab === 'disputed' ? '#991B1B' : '#64748B',
                    }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            value="cancelled"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdCancel size={17} />
                <span>Cancelled</span>
                {counts.cancelled !== undefined && (
                  <Chip
                    label={counts.cancelled}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      bgcolor: activeTab === 'cancelled' ? '#F1F5F9' : '#F8FAFC',
                      color: activeTab === 'cancelled' ? '#334155' : '#64748B',
                    }}
                  />
                )}
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* Orders Table with Server-Side Sorting & Pagination */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>
                  <TableSortLabel
                    active={sortBy === 'order_number'}
                    direction={sortBy === 'order_number' ? sortOrder.toLowerCase() : 'desc'}
                    onClick={() => handleSort('order_number')}
                  >
                    ORDER #
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>BUYER</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>FARMER (SELLER)</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>COMMODITY</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>
                  <TableSortLabel
                    active={sortBy === 'total_price'}
                    direction={sortBy === 'total_price' ? sortOrder.toLowerCase() : 'desc'}
                    onClick={() => handleSort('total_price')}
                  >
                    AMOUNT & FEES
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>
                  <TableSortLabel
                    active={sortBy === 'created_at'}
                    direction={sortBy === 'created_at' ? sortOrder.toLowerCase() : 'desc'}
                    onClick={() => handleSort('created_at')}
                  >
                    DATE (IST)
                  </TableSortLabel>
                </TableCell>
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
                  const item = order.items?.[0];
                  const commodityName = item?.product?.crop?.name_en || order.product?.crop_name || order.product?.variety || 'Agri Produce';
                  const quantity = order.quantity || item?.quantity || 1;
                  const unit = order.unit || item?.unit || 'kg';

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
                          {order.buyer?.full_name || order.buyer?.buyer_profile?.company_name || order.buyer?.name || 'Buyer User'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.buyer?.phone || 'No phone'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="#0F172A">
                          {order.seller?.full_name || order.seller?.seller_profile?.full_name || order.seller?.farm_name || 'Farmer'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.seller?.phone || 'No phone'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="#0F172A">
                          {commodityName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {quantity} {unit} • {formatINR(order.unit_price || Math.round(gross / (quantity || 1)))}/{unit}
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
                          sx={{
                            fontWeight: 700,
                            borderRadius: 2,
                            textTransform: 'none',
                            color: '#166534',
                            borderColor: '#86EFAC',
                            '&:hover': { bgcolor: '#F0FDF4', borderColor: '#166534' },
                          }}
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

        {/* Server-Side Pagination */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={pagination.totalCount}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: '1px solid #E2E8F0' }}
        />
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
                    <Typography variant="body2"><strong>Name:</strong> {selectedOrder.buyer?.full_name || selectedOrder.buyer?.buyer_profile?.company_name || selectedOrder.buyer?.name || 'Buyer'}</Typography>
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
                    <Typography variant="body2"><strong>Farmer:</strong> {selectedOrder.seller?.full_name || selectedOrder.seller?.seller_profile?.full_name || selectedOrder.seller?.farm_name || 'Farmer'}</Typography>
                    <Typography variant="body2"><strong>Phone:</strong> {selectedOrder.seller?.phone || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Commodity:</strong> {selectedOrder.items?.[0]?.product?.crop?.name_en || selectedOrder.product?.crop_name || selectedOrder.product?.variety || 'Agri Produce'}</Typography>
                    <Typography variant="body2"><strong>Contract Volume:</strong> {selectedOrder.quantity || selectedOrder.items?.[0]?.quantity || 1} {selectedOrder.unit || selectedOrder.items?.[0]?.unit || 'kg'}</Typography>
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
                      sx={{ fontWeight: 700, textTransform: 'none' }}
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
                      sx={{ fontWeight: 700, textTransform: 'none' }}
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
                      sx={{ fontWeight: 700, textTransform: 'none' }}
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
                  sx={{ fontWeight: 700, px: 3, textTransform: 'none' }}
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
