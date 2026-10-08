import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Tabs,
  Tab,
  Badge,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  MdCheck,
  MdClose,
  MdVisibility,
  MdLockOpen,
  MdWarning,
  MdEditNote,
} from 'react-icons/md';
import {
  useGetKYCQueueQuery,
  useModerateKYCMutation,
  useUnlockKYCMutation,
  useRejectUnlockKYCMutation,
} from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';

const AdminKYCQueue = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTab = searchParams.get('tab') || 'all';

  const { data: queueData, isLoading } = useGetKYCQueueQuery({
    status: currentTab === 'all' ? undefined : currentTab,
  });

  const moderateKYCMutation = useModerateKYCMutation();
  const unlockKYCMutation = useUnlockKYCMutation();
  const rejectUnlockMutation = useRejectUnlockKYCMutation();

  const [selectedSeller, setSelectedSeller] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [unlockReason, setUnlockReason] = useState('');

  const [declineUnlockModalOpen, setDeclineUnlockModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const sellers = queueData?.items || [];
  const counts = queueData?.counts || {};

  const changeRequestsCount = counts.changeRequests ?? 0;

  const handleTabChange = (_e, newTab) => {
    setSearchParams(newTab === 'all' ? {} : { tab: newTab });
  };

  const handleApprove = async (sellerId) => {
    try {
      await moderateKYCMutation.mutateAsync({
        sellerId,
        status: 'verified',
        reason: 'Documents and bank account verified by officer.',
      });
      toast.success(t('admin.kycVerifiedSuccess', 'Farmer KYC verified successfully!'));
    } catch {
      toast.error(t('admin.kycUpdateError', 'Error updating KYC.'));
    }
  };

  const handleReject = async () => {
    if (!selectedSeller) return;
    try {
      await moderateKYCMutation.mutateAsync({
        sellerId: selectedSeller.user_id,
        status: 'rejected',
        reason: rejectionReason || 'Document mismatch or blurred image.',
      });
      toast.info(t('admin.kycRejectedNotice', 'Farmer KYC marked as rejected.'));
      setRejectModalOpen(false);
      setSelectedSeller(null);
      setRejectionReason('');
    } catch {
      toast.error(t('admin.kycUpdateError', 'Error updating KYC.'));
    }
  };

  const handleUnlock = async () => {
    if (!selectedSeller) return;
    try {
      await unlockKYCMutation.mutateAsync({
        sellerId: selectedSeller.user_id,
        reason: unlockReason || 'Unlocked by officer to allow bank/document updates.',
      });
      toast.success(t('admin.unlockSuccess', 'Farmer profile unlocked. Farmer can now edit and resubmit details.'));
      setUnlockModalOpen(false);
      setSelectedSeller(null);
      setUnlockReason('');
    } catch {
      toast.error('Error unlocking profile.');
    }
  };

  const handleDeclineUnlock = async () => {
    if (!selectedSeller) return;
    try {
      await rejectUnlockMutation.mutateAsync({
        sellerId: selectedSeller.user_id,
        reason: declineReason || 'Change request declined by administrative officer.',
      });
      toast.info(t('admin.declineSuccess', 'Change request declined.'));
      setDeclineUnlockModalOpen(false);
      setSelectedSeller(null);
      setDeclineReason('');
    } catch {
      toast.error('Error declining change request.');
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color="#0F172A">
          {t('admin.farmerKycQueue', '🛡️ Farmer KYC & Verification Control')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t(
            'admin.farmerKycSubtitle',
            'Review land records, Aadhaar references, bank details, and farmer change/unlock requests.'
          )}
        </Typography>
      </Box>

      {/* Change Requests Alert Banner */}
      {changeRequestsCount > 0 && (
        <Alert
          severity="warning"
          icon={<MdWarning size={22} />}
          action={
            currentTab !== 'change_requests' ? (
              <Button
                color="inherit"
                size="small"
                onClick={() => setSearchParams({ tab: 'change_requests' })}
                sx={{ fontWeight: 700 }}
              >
                {t('admin.reviewChangeRequestsBtn', 'Review Change Requests')} ({changeRequestsCount})
              </Button>
            ) : null
          }
          sx={{ mb: 3, borderRadius: 3, border: '1px solid #FCD34D', bgcolor: '#FFFBEB' }}
        >
          <strong>
            {changeRequestsCount}{' '}
            {t(
              'admin.changeRequestAlert',
              'farmer(s) have requested profile details change / bank account unlock.'
            )}
          </strong>
        </Alert>
      )}

      {/* Filter Tabs */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          <Tab
            value="all"
            label={`${t('admin.allKycTab', 'All Farmers')} (${counts.all ?? 0})`}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          />
          <Tab
            value="change_requests"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{t('admin.changeRequestsTab', '🔔 Change Requests')}</span>
                {changeRequestsCount > 0 && (
                  <Chip
                    label={changeRequestsCount}
                    size="small"
                    color="warning"
                    sx={{ height: 20, fontSize: '0.72rem', fontWeight: 800 }}
                  />
                )}
              </Box>
            }
            sx={{
              fontWeight: 700,
              textTransform: 'none',
              color: changeRequestsCount > 0 ? '#D97706' : undefined,
            }}
          />
          <Tab
            value="pending"
            label={`${t('admin.pendingReviewTab', 'Pending Review')} (${counts.pending ?? 0})`}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          />
          <Tab
            value="verified"
            label={`${t('admin.verifiedTab', 'Verified')} (${counts.verified ?? 0})`}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          />
          <Tab
            value="rejected"
            label={`${t('admin.rejectedTab', 'Rejected')} (${counts.rejected ?? 0})`}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          />
        </Tabs>
      </Paper>

      {/* Queue Table */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAF9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>{t('admin.farmerName', 'Farmer Name')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('admin.farmLocation', 'Farm Location')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('admin.landSize', 'Land Size')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('admin.submittedDocuments', 'Documents')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('admin.bankAccount', 'Bank Account')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('admin.kycStatus', 'KYC Status')}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                {t('common.actions', 'Actions')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={28} sx={{ mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.loadingQueue', 'Loading queue...')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : sellers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary" fontWeight={500}>
                    {currentTab === 'change_requests'
                      ? t('admin.noChangeRequestsFound', 'No pending details change requests found.')
                      : t('admin.noKycRecords', 'No KYC records found for this filter.')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sellers.map((s) => {
                const docs = s.kyc_documents || {};
                const hasAadhaar = !!docs.aadhaar?.file_url;
                const hasLand = !!docs.land_record?.file_url;
                const hasBank = !!docs.bank_proof?.file_url;

                const unlockReq = docs.unlock_request || null;
                const isUnlockPending = unlockReq?.status === 'pending';

                return (
                  <TableRow
                    key={s.id}
                    hover
                    sx={{
                      bgcolor: isUnlockPending ? '#FFFBEB' : undefined,
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {s.full_name}
                        </Typography>
                        {isUnlockPending && (
                          <Tooltip title={`Change Requested: "${unlockReq.reason}"`}>
                            <Chip
                              size="small"
                              label={t('admin.changeRequestedBadge', '🔔 Change Requested')}
                              color="warning"
                              sx={{ fontWeight: 800, fontSize: '0.68rem', height: 20 }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {s.farm_name || t('admin.individualKrishi', 'Individual Krishi')}
                      </Typography>

                      {isUnlockPending && (
                        <Box sx={{ mt: 0.5, p: 0.8, bgcolor: '#FEF3C7', borderRadius: 1.5, border: '1px solid #FDE68A' }}>
                          <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 600, display: 'block' }}>
                            📝 {t('admin.farmerReasonPrefix', 'Reason')}: "{unlockReq.reason}"
                          </Typography>
                          {unlockReq.requested_fields && (
                            <Typography variant="caption" sx={{ color: '#B45309', display: 'block' }}>
                              Categories: {unlockReq.requested_fields.join(', ')}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </TableCell>

                    <TableCell>
                      {s.village}, {s.district}, {s.state}
                    </TableCell>

                    <TableCell>
                      {s.land_size_acres ? `${s.land_size_acres} ${t('admin.acres', 'Acres')}` : 'N/A'}
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        <Tooltip title={hasAadhaar ? 'Aadhaar Attached' : 'Aadhaar Missing'}>
                          <Chip
                            size="small"
                            label="ID"
                            color={hasAadhaar ? 'success' : 'default'}
                            variant={hasAadhaar ? 'filled' : 'outlined'}
                            sx={{ fontSize: '0.68rem', height: 20 }}
                          />
                        </Tooltip>
                        <Tooltip title={hasLand ? '7/12 Land Record Attached' : '7/12 Missing'}>
                          <Chip
                            size="small"
                            label="7/12"
                            color={hasLand ? 'success' : 'default'}
                            variant={hasLand ? 'filled' : 'outlined'}
                            sx={{ fontSize: '0.68rem', height: 20 }}
                          />
                        </Tooltip>
                        <Tooltip title={hasBank ? 'Bank Proof Attached' : 'Bank Proof Missing'}>
                          <Chip
                            size="small"
                            label="Bank"
                            color={hasBank ? 'success' : 'default'}
                            variant={hasBank ? 'filled' : 'outlined'}
                            sx={{ fontSize: '0.68rem', height: 20 }}
                          />
                        </Tooltip>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{s.bank_name || t('admin.bankOnFile', 'Bank on file')}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {s.masked_account || 'XXXXXXXX5019'} ({s.bank_ifsc || 'SBIN...'})
                      </Typography>
                      {s.name_mismatch && (
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            icon={<MdWarning />}
                            label={`Name Mismatch ("${s.bank_holder_name}")`}
                            color="error"
                            size="small"
                            sx={{ fontSize: '0.66rem', height: 20, fontWeight: 700 }}
                          />
                        </Box>
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={
                          s.kyc_status === 'verified'
                            ? t('admin.verifiedBadge', 'VERIFIED')
                            : s.kyc_status === 'rejected'
                            ? t('admin.rejectedBadge', 'REJECTED')
                            : s.kyc_status === 'pending'
                            ? t('admin.pendingBadge', 'PENDING')
                            : t('admin.unverifiedBadge', 'UNVERIFIED')
                        }
                        size="small"
                        color={
                          s.kyc_status === 'verified'
                            ? 'success'
                            : s.kyc_status === 'rejected'
                            ? 'error'
                            : s.kyc_status === 'pending'
                            ? 'warning'
                            : 'default'
                        }
                        sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {isUnlockPending && (
                          <Button
                            size="small"
                            variant="contained"
                            color="warning"
                            startIcon={<MdLockOpen />}
                            onClick={() => {
                              setSelectedSeller(s);
                              setUnlockReason(s.kyc_documents?.unlock_request?.reason || '');
                              setUnlockModalOpen(true);
                            }}
                            sx={{ fontWeight: 700 }}
                          >
                            {t('admin.reviewAndUnlockBtn', 'Review & Unlock')}
                          </Button>
                        )}

                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<MdVisibility />}
                          onClick={() => navigate(`/admin/kyc/${s.user_id}`)}
                          sx={{ fontWeight: 600 }}
                        >
                          {t('admin.inspectDocumentsBtn', 'Inspect Documents')}
                        </Button>

                        {s.kyc_status !== 'verified' && !isUnlockPending && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<MdCheck />}
                            onClick={() => handleApprove(s.user_id)}
                          >
                            {t('admin.approve', 'Approve')}
                          </Button>
                        )}

                        {s.kyc_status === 'verified' && !isUnlockPending && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            startIcon={<MdClose />}
                            onClick={() => {
                              setSelectedSeller(s);
                              setRejectModalOpen(true);
                            }}
                          >
                            Revoke KYC
                          </Button>
                        )}

                        {s.kyc_status !== 'verified' && s.kyc_status !== 'rejected' && !isUnlockPending && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<MdClose />}
                            onClick={() => {
                              setSelectedSeller(s);
                              setRejectModalOpen(true);
                            }}
                          >
                            {t('admin.reject', 'Reject')}
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* KYC Rejection Modal */}
      <Dialog open={rejectModalOpen} onClose={() => setRejectModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{t('admin.reasonForRejection', 'Reason for KYC Rejection')}</DialogTitle>
        <DialogContent dividers>
          <TextField
            label={t('admin.rejectionExplanation', 'Explanation (Sent to Farmer)')}
            fullWidth
            multiline
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder={t('admin.rejectionPlaceholder', 'e.g. Document image unclear or bank name mismatch.')}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRejectModalOpen(false)}>{t('common.cancel', 'Cancel')}</Button>
          <Button variant="contained" color="error" onClick={handleReject}>
            {t('admin.submitRejection', 'Submit Rejection')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unlock for Updates Modal */}
      <Dialog open={unlockModalOpen} onClose={() => setUnlockModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {t('admin.unlockFarmerTitle', 'Unlock Profile for Information Updates')}
        </DialogTitle>
        <DialogContent dividers>
          {selectedSeller?.kyc_documents?.unlock_request && (
            <Box sx={{ mb: 2, p: 2, bgcolor: '#FFFBEB', borderRadius: 2, border: '1px solid #FCD34D' }}>
              <Typography variant="subtitle2" fontWeight={700} color="#92400E">
                🔔 {t('admin.farmerRequestedReason', 'Farmer Request Details')}:
              </Typography>
              <Typography variant="body2" color="#0F172A" sx={{ mt: 0.5 }}>
                "{selectedSeller.kyc_documents.unlock_request.reason}"
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Submitted on:{' '}
                {new Date(selectedSeller.kyc_documents.unlock_request.requested_at).toLocaleString()}
              </Typography>
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t(
              'admin.unlockExplanation',
              'Unlocking this profile allows the farmer to edit their bank account and documents again. The KYC badge will be temporarily paused until the farmer re-submits and it is approved.'
            )}
          </Typography>

          <TextField
            label={t('admin.unlockReasonLabel', 'Officer Note / Reason for Unlock')}
            fullWidth
            multiline
            rows={3}
            value={unlockReason}
            onChange={(e) => setUnlockReason(e.target.value)}
            placeholder={t('admin.unlockReasonPlaceholder', 'e.g. Farmer requested bank account correction.')}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setUnlockModalOpen(false)}>{t('common.cancel', 'Cancel')}</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleUnlock}
            disabled={unlockKYCMutation.isPending}
            startIcon={unlockKYCMutation.isPending ? <CircularProgress size={16} /> : <MdLockOpen />}
            sx={{ fontWeight: 700 }}
          >
            {t('admin.confirmUnlockBtn', 'Confirm & Unlock Profile')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminKYCQueue;
