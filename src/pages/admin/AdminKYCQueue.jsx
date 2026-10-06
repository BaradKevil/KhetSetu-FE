import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { MdCheck, MdClose, MdVisibility, MdDescription } from 'react-icons/md';
import { useGetKYCQueueQuery, useModerateKYCMutation } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';

const AdminKYCQueue = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { data: queueData, isLoading } = useGetKYCQueueQuery();
  const moderateKYCMutation = useModerateKYCMutation();

  const [selectedSeller, setSelectedSeller] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const sellers = queueData?.items || [];

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
    } catch {
      toast.error(t('admin.kycUpdateError', 'Error updating KYC.'));
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight={800} color="#0F172A">
          {t('admin.farmerKycQueue', '🛡️ Farmer KYC Verification Queue')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('admin.farmerKycSubtitle', 'Review land records, Aadhaar references, and bank account holders before issuing verified badges.')}
        </Typography>
      </Box>

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
              <TableCell align="right" sx={{ fontWeight: 700 }}>{t('common.actions', 'Actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  {t('admin.loadingQueue', 'Loading queue...')}
                </TableCell>
              </TableRow>
            ) : sellers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">{t('admin.noKycRecords', 'No KYC records in queue.')}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              sellers.map((s) => {
                const docs = s.kyc_documents || {};
                const hasAadhaar = !!docs.aadhaar?.file_url;
                const hasLand = !!docs.land_record?.file_url;
                const hasBank = !!docs.bank_proof?.file_url;

                return (
                  <TableRow key={s.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {s.full_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {s.farm_name || t('admin.individualKrishi', 'Individual Krishi')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {s.village}, {s.district}, {s.state}
                    </TableCell>
                    <TableCell>{s.land_size_acres ? `${s.land_size_acres} ${t('admin.acres', 'Acres')}` : 'N/A'}</TableCell>
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
                      <Typography variant="body2">
                        {s.bank_name || t('admin.bankOnFile', 'Bank on file')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {s.masked_account || 'XXXXXXXX5019'} ({s.bank_ifsc || 'SBIN...'})
                      </Typography>
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
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
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
                        {s.kyc_status !== 'verified' && (
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
                        {s.kyc_status !== 'rejected' && (
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

      {/* Rejection Modal */}
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
    </Box>
  );
};

export default AdminKYCQueue;
