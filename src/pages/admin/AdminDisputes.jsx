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
  Divider,
  InputAdornment,
  Tabs,
  Tab,
  TablePagination,
  TableSortLabel,
} from '@mui/material';
import {
  MdSearch,
  MdGavel,
  MdAssignmentReturn,
  MdCheckCircle,
  MdCancel,
  MdWarning,
  MdFileDownload,
  MdHourglassTop,
  MdReportProblem,
} from 'react-icons/md';
import { useGetAdminDisputesQuery, useResolveDisputeMutation } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';
import PageHeader from '../../common/custom/PageHeader';
import KPICard from '../../common/custom/KPICard';
import StatusBadge from '../../common/custom/StatusBadge';

const formatINR = (val) => {
  const num = Number(val) || 0;
  return '₹' + num.toLocaleString('en-IN');
};

const getStatusChip = (status) => {
  switch (status) {
    case 'open':
    case 'pending':
      return <Chip label="⚠️ OPEN CLAIM" size="small" color="error" sx={{ fontWeight: 800, fontSize: '0.72rem' }} />;
    case 'under_review':
    case 'investigating':
      return <Chip label="UNDER REVIEW" size="small" color="warning" sx={{ fontWeight: 800, fontSize: '0.72rem' }} />;
    case 'resolved':
    case 'resolved_seller':
    case 'resolved_buyer_refund':
      return <Chip label="ARBITRATED & SETTLED" size="small" color="success" sx={{ fontWeight: 800, fontSize: '0.72rem' }} />;
    case 'dismissed':
    default:
      return <Chip label="DISMISSED" size="small" sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: '#F1F5F9', color: '#64748B' }} />;
  }
};

const AdminDisputes = () => {
  const { formatDate } = useLanguage();

  // Search & Tab States
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Sorting & Pagination States (handled by backend)
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Arbitration Dialog
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolutionAction, setResolutionAction] = useState(''); // 'resolved_buyer_refund' | 'resolved_seller' | 'dismissed'
  const [resolutionNotes, setResolutionNotes] = useState('');

  const { data: disputesData, isLoading, refetch } = useGetAdminDisputesQuery({
    search: searchTerm.trim() || undefined,
    status: activeTab !== 'all' ? activeTab : undefined,
    sortBy,
    sortOrder,
    page,
    limit: rowsPerPage,
  });

  const resolveDisputeMutation = useResolveDisputeMutation();

  const disputes = disputesData?.items || disputesData?.data || (Array.isArray(disputesData) ? disputesData : []);
  const pagination = disputesData?.pagination || {
    currentPage: page,
    totalPages: Math.ceil(disputes.length / rowsPerPage) || 1,
    totalCount: disputes.length,
    limit: rowsPerPage,
  };
  const counts = disputesData?.counts || {};

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

  const handleExecuteArbitration = async () => {
    if (!selectedDispute || !resolutionAction) return;
    if (!resolutionNotes.trim()) {
      toast.error('A formal finding & arbitration ruling is mandatory to resolve this dispute.');
      return;
    }

    try {
      await resolveDisputeMutation.mutateAsync({
        id: selectedDispute.id,
        outcome: resolutionAction,
        resolutionNotes: resolutionNotes,
      });
      toast.success(`Dispute #${selectedDispute.id} arbitration concluded with: ${resolutionAction.replace(/_/g, ' ')}.`);
      setSelectedDispute(null);
      setResolutionAction('');
      setResolutionNotes('');
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to arbitrate dispute.');
    }
  };

  const exportDisputesCSV = () => {
    if (!disputes.length) {
      toast.info('No disputes to export.');
      return;
    }
    const headers = [
      'Dispute ID',
      'Dispute Number',
      'Order ID',
      'Order Number',
      'Order Total',
      'Claimant Phone',
      'Reason',
      'Status',
      'Filed Date',
    ];

    const rows = disputes.map((d) => [
      d.id,
      d.dispute_number || `DSP-${d.id}`,
      d.order_id || d.order?.id,
      d.order?.order_number || `ORD-${d.order_id}`,
      Number(d.order?.total_price || d.order?.total_amount || 0),
      `"${d.raised_by_user?.phone || d.claimant?.phone || ''}"`,
      `"${(d.reason || '').replace(/"/g, '""')}"`,
      d.status || 'open',
      new Date(d.createdAt || d.created_at || Date.now()).toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `khetsetu_disputes_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Page Header (Reference Design) */}
      <PageHeader
        title="Disputes & Arbitration Tribunal"
        subtitle="Adjudicate contested escrow transactions, damaged consignments, weight discrepancies, and contract non-fulfillment."
        actions={
          <Button
            variant="contained"
            color="primary"
            startIcon={<MdFileDownload size={18} />}
            onClick={exportDisputesCSV}
            sx={{
              fontWeight: 700,
              borderRadius: 2,
              px: 2.5,
              py: 1,
            }}
          >
            Export Disputes CSV
          </Button>
        }
      />

      {/* 3 KPI Stat Cards (Uniform full-width grid) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2.5,
          mb: 3,
          width: '100%',
        }}
      >
        <KPICard
          icon={<MdGavel size={24} />}
          label="Total Disputes"
          value={pagination.totalCount || disputes.length}
          color="blue"
        />
        <KPICard
          icon={<MdReportProblem size={24} />}
          label="Open Claims (Action Required)"
          value={counts.open ?? disputes.filter(d => d.status === 'open' || d.status === 'pending').length}
          color="red"
        />
        <KPICard
          icon={<MdCheckCircle size={24} />}
          label="Resolved / Settled"
          value={counts.resolved ?? disputes.filter(d => d.status === 'resolved' || d.status === 'dismissed').length}
          color="green"
        />
      </Box>

      {/* Top Controls: Search Bar on Left */}
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
            placeholder="Search by Dispute #, Reason or Details..."
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
                <MdGavel size={18} />
                <span>All Claims</span>
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
            value="open"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdReportProblem size={17} />
                <span>Open Claims</span>
                {counts.open !== undefined && (
                  <Chip
                    label={counts.open}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      bgcolor: activeTab === 'open' ? '#FEE2E2' : '#F1F5F9',
                      color: activeTab === 'open' ? '#991B1B' : '#64748B',
                    }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            value="under_review"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdHourglassTop size={17} />
                <span>Under Review</span>
                {counts.under_review !== undefined && (
                  <Chip
                    label={counts.under_review}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      bgcolor: activeTab === 'under_review' ? '#FEF3C7' : '#F1F5F9',
                      color: activeTab === 'under_review' ? '#92400E' : '#64748B',
                    }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            value="resolved"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdCheckCircle size={17} />
                <span>Resolved & Settled</span>
                {counts.resolved !== undefined && (
                  <Chip
                    label={counts.resolved}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      bgcolor: activeTab === 'resolved' ? '#DCFCE7' : '#F1F5F9',
                      color: activeTab === 'resolved' ? '#15803D' : '#64748B',
                    }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            value="dismissed"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdCancel size={17} />
                <span>Dismissed</span>
                {counts.dismissed !== undefined && (
                  <Chip
                    label={counts.dismissed}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      bgcolor: activeTab === 'dismissed' ? '#F1F5F9' : '#F8FAFC',
                      color: activeTab === 'dismissed' ? '#334155' : '#64748B',
                    }}
                  />
                )}
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* Disputes Table with Server-Side Sorting & Pagination */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>
                  <TableSortLabel
                    active={sortBy === 'id'}
                    direction={sortBy === 'id' ? sortOrder.toLowerCase() : 'desc'}
                    onClick={() => handleSort('id')}
                  >
                    CLAIM ID
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>ORDER # & ESCROW</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>CLAIMANT</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>DISPUTE REASON</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>
                  <TableSortLabel
                    active={sortBy === 'created_at'}
                    direction={sortBy === 'created_at' ? sortOrder.toLowerCase() : 'desc'}
                    onClick={() => handleSort('created_at')}
                  >
                    FILED DATE
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#2E7D32' }} />
                  </TableCell>
                </TableRow>
              ) : disputes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" fontWeight={600} color="text.secondary">
                      No active disputes or claims match this filter.
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      All escrow contracts are executing within normal delivery parameters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                disputes.map((d) => (
                  <TableRow key={d.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={800} color="#0F172A">
                        CLAIM #{d.id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {d.dispute_number || 'Escrow Hold Contested'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="#0F172A">
                        {d.order?.order_number || `ORD-${d.order_id}`}
                      </Typography>
                      <Typography variant="caption" color="#166534" fontWeight={700} display="block">
                        Escrow: {formatINR(d.order?.total_price || d.order?.total_amount || 0)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="#0F172A">
                        {d.raised_by_user?.phone || d.claimant?.full_name || 'Complainant'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: #{d.raised_by || 'User'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="#0F172A" sx={{ maxWidth: 280 }}>
                        {d.reason || d.claim_notes || 'Contract disagreement or consignment defect.'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {getStatusChip(d.status || 'open')}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="#334155">
                        {formatDate(d.createdAt || d.created_at, false)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<MdGavel />}
                        onClick={() => {
                          setSelectedDispute(d);
                          setResolutionAction('');
                          setResolutionNotes('');
                        }}
                        sx={{
                          fontWeight: 700,
                          borderRadius: 2,
                          textTransform: 'none',
                        }}
                      >
                        Arbitrate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
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

      {/* Arbitration Modal */}
      <Dialog
        open={Boolean(selectedDispute)}
        onClose={() => setSelectedDispute(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        {selectedDispute && (
          <>
            <DialogTitle sx={{ fontWeight: 800 }}>
              Arbitration Hearing: Claim #{selectedDispute.id} (Order {selectedDispute.order?.order_number || `#${selectedDispute.order_id}`})
            </DialogTitle>
            <DialogContent dividers>
              {/* Evidence & Case Overview */}
              <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2.5, bgcolor: '#FFFBEB', border: '1px solid #FCD34D' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <MdWarning size={22} color="#D97706" />
                  <Typography variant="subtitle2" fontWeight={800} color="#92400E">
                    CONTESTED CLAIM STATEMENT
                  </Typography>
                </Box>
                <Typography variant="body2" color="#78350F" sx={{ mb: 1.5 }}>
                  "{selectedDispute.reason || selectedDispute.claim_notes || 'No statement provided'}"
                </Typography>
                <Divider sx={{ mb: 1.5, borderColor: '#FDE68A' }} />
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3} size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">Contested Value</Typography>
                    <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                      {formatINR(selectedDispute.order?.total_price || selectedDispute.order?.total_amount || 0)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">Current Order Status</Typography>
                    <Typography variant="subtitle1" fontWeight={800} color="#DC2626">
                      {selectedDispute.order?.status?.toUpperCase() || 'LOCKED'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">Commodity</Typography>
                    <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                      {selectedDispute.order?.product?.crop_name || 'Agri Commodity'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3} size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">Volume</Typography>
                    <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                      {selectedDispute.order?.quantity || 1} {selectedDispute.order?.unit || 'kg'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Legal Judgment Selection */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 1.5 }}>
                  Arbitration Decision (Binding Judgment):
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
                    <Button
                      fullWidth
                      variant={resolutionAction === 'resolved_buyer_refund' ? 'contained' : 'outlined'}
                      color="error"
                      startIcon={<MdAssignmentReturn />}
                      onClick={() => setResolutionAction('resolved_buyer_refund')}
                      sx={{ fontWeight: 700, py: 1.5, textTransform: 'none' }}
                    >
                      Full Refund to Buyer
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
                    <Button
                      fullWidth
                      variant={resolutionAction === 'resolved_seller' ? 'contained' : 'outlined'}
                      color="success"
                      startIcon={<MdCheckCircle />}
                      onClick={() => setResolutionAction('resolved_seller')}
                      sx={{ fontWeight: 700, py: 1.5, textTransform: 'none' }}
                    >
                      Release Funds to Farmer
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
                    <Button
                      fullWidth
                      variant={resolutionAction === 'dismissed' ? 'contained' : 'outlined'}
                      color="inherit"
                      startIcon={<MdCancel />}
                      onClick={() => setResolutionAction('dismissed')}
                      sx={{ fontWeight: 700, py: 1.5, textTransform: 'none' }}
                    >
                      Dismiss Claim
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {resolutionAction && (
                <Box sx={{ mt: 2.5 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Official Arbitration Ruling & Finding (Logged to Audit Trail)"
                    placeholder="Describe evidence inspected, reason for refund/release, and compliance notes..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    required
                  />
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setSelectedDispute(null)} sx={{ fontWeight: 700 }}>
                Cancel
              </Button>
              {resolutionAction && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleExecuteArbitration}
                  disabled={resolveDisputeMutation.isPending || !resolutionNotes.trim()}
                  sx={{ fontWeight: 700, px: 3, textTransform: 'none' }}
                >
                  {resolveDisputeMutation.isPending ? 'Executing Ruling...' : 'Enforce Arbitration Ruling'}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AdminDisputes;
