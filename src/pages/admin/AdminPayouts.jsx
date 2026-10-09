import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tooltip,
  Grid,
} from '@mui/material';
import { MdCheckCircle, MdPauseCircle, MdWarning, MdSecurity, MdLocalAtm, MdPayments } from 'react-icons/md';
import { useGetPayoutsQuery, useApprovePayoutMutation, useHoldPayoutMutation } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';
import PageHeader from '../../common/custom/PageHeader';
import KPICard from '../../common/custom/KPICard';
import StatusBadge from '../../common/custom/StatusBadge';

const AdminPayouts = () => {
  const { t, formatCurrency, formatDate } = useLanguage();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' | 'hold'
  const [actionReason, setActionReason] = useState('');

  const { data: payoutsData, isLoading } = useGetPayoutsQuery({
    status: activeTab !== 'all' ? activeTab : undefined,
  });

  const approvePayoutMutation = useApprovePayoutMutation();
  const holdPayoutMutation = useHoldPayoutMutation();

  const payouts = payoutsData?.items || [];

  const handleOpenAction = (payout, type) => {
    setSelectedPayout(payout);
    setActionType(type);
    setActionReason('');
  };

  const handleConfirmAction = async () => {
    if (!selectedPayout) return;
    try {
      if (actionType === 'approve') {
        await approvePayoutMutation.mutateAsync({
          id: selectedPayout.id,
          note: actionReason || 'Approved by finance checker officer',
        });
        toast.success(`Payout #${selectedPayout.id} approved and disbursement initiated.`);
      } else if (actionType === 'hold') {
        if (!actionReason.trim()) {
          toast.error('A mandatory reason is required to hold a payout.');
          return;
        }
        await holdPayoutMutation.mutateAsync({
          id: selectedPayout.id,
          reason: actionReason,
        });
        toast.warning(`Payout #${selectedPayout.id} placed on administrative hold.`);
      }
      setSelectedPayout(null);
      setActionType(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error processing payout action.');
    }
  };

  return (
    <Box>
      {/* Page Header (Reference Design) */}
      <PageHeader
        title={t('admin.payoutApprovalsTitle', 'Payout Approvals & Disbursements')}
        subtitle={t('admin.payoutApprovalsSubtitle', 'Pre-settlement verification, automated name-match audit, and disbursement clearance for escrow proceeds.')}
      />

      {/* 3 KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
          <KPICard
            icon={<MdLocalAtm size={24} />}
            label="Total Payouts"
            value={payouts.length}
            color="blue"
          />
        </Grid>
        <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
          <KPICard
            icon={<MdWarning size={24} />}
            label="Awaiting Clearance"
            value={payouts.filter(p => p.status === 'pending_approval' || p.status === 'pending').length}
            color="amber"
          />
        </Grid>
        <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
          <KPICard
            icon={<MdCheckCircle size={24} />}
            label="Disbursed & Settled"
            value={payouts.filter(p => p.status === 'completed' || p.status === 'approved').length}
            color="green"
          />
        </Grid>
      </Grid>

      {/* Tabs Row */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Tabs
          value={activeTab}
          onChange={(_e, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ px: 2 }}
        >
          <Tab value="all" label="All Payouts" sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab value="pending_approval" label="Awaiting Approval" sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab value="approved" label="Approved" sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab value="completed" label="Completed / Settled" sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab value="held" label="On Hold" sx={{ textTransform: 'none', fontWeight: 700 }} />
        </Tabs>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAF9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Payout ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Timestamp (IST)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Beneficiary Farmer</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Pre-Settlement Checks</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>UTR / Bank Ref</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Net Payable</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Maker-Checker Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  {t('admin.loadingPayouts', 'Loading payouts queue...')}
                </TableCell>
              </TableRow>
            ) : payouts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">{t('admin.noPayouts', 'No payouts found matching current filter.')}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              payouts.map((p) => {
                const preChecks = p.pre_checks || {};
                const nameMismatch = preChecks.name_mismatch;

                return (
                  <TableRow key={p.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      #{p.id}
                      <Typography variant="caption" color="text.secondary" display="block">
                        Order #{p.order_id}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                      <Tooltip title={`UTC: ${new Date(p.createdAt || p.created_at).toUTCString()}`}>
                        <span>{formatDate(p.createdAt || p.created_at, true)}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {p.seller?.seller_profile?.full_name || 'Farmer'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Bank: {p.seller?.seller_profile?.bank_name} ({p.seller?.seller_profile?.masked_account})
                      </Typography>
                      {preChecks.bank_holder_name && (
                        <Typography variant="caption" color={nameMismatch ? 'error.main' : 'text.secondary'}>
                          Account Holder: "{preChecks.bank_holder_name}"
                        </Typography>
                      )}
                    </TableCell>

                    {/* Pre-Settlement Automated Checks */}
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {nameMismatch ? (
                          <Chip
                            icon={<MdWarning />}
                            label="⚠️ Name Mismatch"
                            color="error"
                            size="small"
                            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                          />
                        ) : (
                          <Chip
                            icon={<MdCheckCircle />}
                            label="Name Match OK"
                            color="success"
                            size="small"
                            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                          />
                        )}
                        <Chip
                          label={preChecks.kyc_verified ? 'KYC Verified' : 'KYC Pending'}
                          color={preChecks.kyc_verified ? 'success' : 'warning'}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600, fontSize: '0.68rem' }}
                        />
                      </Box>
                    </TableCell>

                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {p.utr_number || p.bank_reference || (
                        <span style={{ color: '#94A3B8' }}>Pending UTR</span>
                      )}
                    </TableCell>

                    <TableCell sx={{ fontWeight: 800, color: '#2E7D32' }}>
                      {formatCurrency(p.amount_paise, true)}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={p.status.replace('_', ' ').toUpperCase()}
                        size="small"
                        color={
                          p.status === 'completed'
                            ? 'success'
                            : p.status === 'approved'
                            ? 'primary'
                            : p.status === 'held'
                            ? 'error'
                            : 'warning'
                        }
                        sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      {p.status !== 'completed' ? (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleOpenAction(p, 'approve')}
                            sx={{ borderRadius: 1.5, fontWeight: 700, textTransform: 'none', fontSize: '0.75rem' }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleOpenAction(p, 'hold')}
                            sx={{ borderRadius: 1.5, fontWeight: 700, textTransform: 'none', fontSize: '0.75rem' }}
                          >
                            Hold
                          </Button>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Settled
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Maker-Checker Confirmation Dialog */}
      {selectedPayout && (
        <Dialog open={Boolean(selectedPayout)} onClose={() => setSelectedPayout(null)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {actionType === 'approve' ? 'Clear Payout for Disbursement' : 'Place Payout on Administrative Hold'}
          </DialogTitle>
          <DialogContent dividers>
            <Alert
              severity={actionType === 'approve' ? 'info' : 'warning'}
              icon={<MdSecurity size={24} />}
              sx={{ mb: 2.5, borderRadius: 2 }}
            >
              {actionType === 'approve'
                ? `You are authorizing the release of ${formatCurrency(selectedPayout.amount_paise, true)} to ${selectedPayout.seller?.seller_profile?.full_name || 'Farmer'}. This will trigger the bank disbursement sequence.`
                : `Holding payout #${selectedPayout.id} will freeze the disbursement until compliance review is completed.`}
            </Alert>

            {selectedPayout.pre_checks?.name_mismatch && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                <strong>⚠️ Warning:</strong> Account holder name "{selectedPayout.pre_checks?.bank_holder_name}" differs from farmer KYC name "{selectedPayout.seller?.seller_profile?.full_name}". Verify account ownership before approving.
              </Alert>
            )}

            <TextField
              fullWidth
              multiline
              rows={3}
              label={actionType === 'approve' ? 'Approval Note (Optional)' : 'Mandatory Reason for Hold *'}
              placeholder={actionType === 'approve' ? 'e.g. Bank proof and weighing verified' : 'e.g. Account holder name mismatch requires manual proof review'}
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              required={actionType === 'hold'}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setSelectedPayout(null)} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color={actionType === 'approve' ? 'success' : 'error'}
              onClick={handleConfirmAction}
              disabled={actionType === 'hold' && !actionReason.trim()}
              sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', px: 3 }}
            >
              {actionType === 'approve' ? 'Confirm & Release Payout' : 'Confirm Hold'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default AdminPayouts;
