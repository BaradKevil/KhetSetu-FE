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
  Grid,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  MdSearch,
  MdVisibility,
  MdGavel,
  MdRefresh,
  MdAssignmentReturn,
  MdCheckCircle,
  MdCancel,
  MdWarning,
} from 'react-icons/md';
import { useGetAdminDisputesQuery, useResolveDisputeMutation } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';

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
      return <Chip label="ARBITRATED & SETTLED" size="small" color="success" sx={{ fontWeight: 800, fontSize: '0.72rem' }} />;
    case 'dismissed':
    default:
      return <Chip label="DISMISSED" size="small" sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: '#F1F5F9', color: '#64748B' }} />;
  }
};

const AdminDisputes = () => {
  const { formatDate } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Arbitration Dialog
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolutionAction, setResolutionAction] = useState(''); // 'refund_to_buyer' | 'release_to_seller' | 'dismiss'
  const [resolutionNotes, setResolutionNotes] = useState('');

  const { data: disputesData, isLoading, refetch } = useGetAdminDisputesQuery({
    search: searchTerm || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    limit: 50,
  });

  const resolveDisputeMutation = useResolveDisputeMutation();

  const disputes = Array.isArray(disputesData) ? disputesData : disputesData?.data || [];

  const handleExecuteArbitration = async () => {
    if (!selectedDispute || !resolutionAction) return;
    if (!resolutionNotes.trim()) {
      toast.error('A formal finding & arbitration ruling is mandatory to resolve this dispute.');
      return;
    }

    try {
      await resolveDisputeMutation.mutateAsync({
        id: selectedDispute.id,
        resolution: resolutionAction,
        notes: resolutionNotes,
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

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 } }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#0F172A">
            Disputes & Arbitration Tribunal
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Adjudicate contested escrow transactions, damaged consignments, weight discrepancies, and contract non-fulfillment.
          </Typography>
        </Box>
        <IconButton onClick={() => refetch()} sx={{ bgcolor: '#F1F5F9' }}>
          <MdRefresh />
        </IconButton>
      </Box>

      {/* Filter and Search Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5} size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by Claim ID, Order # or Party Name..."
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
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto' }}>
              {[
                { label: 'All Disputes', val: 'all' },
                { label: 'Open Claims', val: 'open' },
                { label: 'Under Review', val: 'under_review' },
                { label: 'Resolved', val: 'resolved' },
                { label: 'Dismissed', val: 'dismissed' },
              ].map((tab) => (
                <Chip
                  key={tab.val}
                  label={tab.label}
                  clickable
                  color={statusFilter === tab.val ? 'primary' : 'default'}
                  variant={statusFilter === tab.val ? 'filled' : 'outlined'}
                  onClick={() => setStatusFilter(tab.val)}
                  sx={{ fontWeight: 700, fontSize: '0.8rem' }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Disputes Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>CLAIM ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>ORDER # & ESCROW</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>CLAIMANT</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>DISPUTE REASON</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>FILED DATE</TableCell>
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
                      No active disputes or claims on file.
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
                        Type: {d.dispute_type || 'Escrow Hold Contested'}
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
                        {d.claimant?.full_name || d.claimant?.name || 'Complainant'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {d.claimant?.phone || ''}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="#0F172A" sx={{ maxWidth: 260 }}>
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
                        sx={{ fontWeight: 700 }}
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
                      {selectedDispute.order?.quantity} {selectedDispute.order?.unit || 'kg'}
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
                      variant={resolutionAction === 'refund_to_buyer' ? 'contained' : 'outlined'}
                      color="error"
                      startIcon={<MdAssignmentReturn />}
                      onClick={() => setResolutionAction('refund_to_buyer')}
                      sx={{ fontWeight: 700, py: 1.5 }}
                    >
                      Full Refund to Buyer
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
                    <Button
                      fullWidth
                      variant={resolutionAction === 'release_to_seller' ? 'contained' : 'outlined'}
                      color="success"
                      startIcon={<MdCheckCircle />}
                      onClick={() => setResolutionAction('release_to_seller')}
                      sx={{ fontWeight: 700, py: 1.5 }}
                    >
                      Release Funds to Farmer
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
                    <Button
                      fullWidth
                      variant={resolutionAction === 'dismiss' ? 'contained' : 'outlined'}
                      color="inherit"
                      startIcon={<MdCancel />}
                      onClick={() => setResolutionAction('dismiss')}
                      sx={{ fontWeight: 700, py: 1.5 }}
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
                  sx={{ fontWeight: 700, px: 3 }}
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
