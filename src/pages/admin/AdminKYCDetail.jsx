import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import {
  MdArrowBack,
  MdCheckCircle,
  MdCancel,
  MdOpenInNew,
  MdVisibility,
  MdBadge,
  MdLandscape,
  MdAccountBalance,
  MdDescription,
  MdZoomIn,
  MdClose,
  MdLockOpen,
  MdWarning,
} from 'react-icons/md';
import {
  useGetKYCDetailsQuery,
  useModerateKYCMutation,
  useUnlockKYCMutation,
  useRejectUnlockKYCMutation,
} from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';
import PageHeader from '../../common/custom/PageHeader';
import StatusBadge from '../../common/custom/StatusBadge';

const BACKEND_URL =
  (import.meta.env.VITE_BASEURL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const getDocumentUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const AdminKYCDetail = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { data: profile, isLoading, error } = useGetKYCDetailsQuery(sellerId);
  const moderateKYCMutation = useModerateKYCMutation();
  const unlockKYCMutation = useUnlockKYCMutation();
  const rejectUnlockMutation = useRejectUnlockKYCMutation();

  const [previewImage, setPreviewImage] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [unlockReason, setUnlockReason] = useState('');
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const documents = profile?.kyc_documents || {};
  const aadhaarDoc = documents.aadhaar || null;
  const landDoc = documents.land_record || null;
  const bankDoc = documents.bank_proof || null;

  const handleApprove = async () => {
    try {
      await moderateKYCMutation.mutateAsync({
        sellerId: Number(sellerId),
        status: 'verified',
        reason: 'Documents (Aadhaar, Gujarat 7/12 & 8A, Bank Proof) inspected and verified by officer.',
      });
      toast.success(t('admin.kycVerifiedSuccess', 'Farmer KYC verified successfully!'));
    } catch {
      toast.error(t('admin.kycUpdateError', 'Error updating KYC status.'));
    }
  };

  const handleReject = async () => {
    try {
      await moderateKYCMutation.mutateAsync({
        sellerId: Number(sellerId),
        status: 'rejected',
        reason: rejectionReason || 'Document mismatch or blurred image.',
      });
      toast.info(t('admin.kycRejectedNotice', 'Farmer KYC marked as rejected.'));
      setRejectModalOpen(false);
    } catch {
      toast.error(t('admin.kycUpdateError', 'Error updating KYC status.'));
    }
  };

  const handleUnlock = async () => {
    try {
      await unlockKYCMutation.mutateAsync({
        sellerId: Number(sellerId),
        reason: unlockReason || 'Unlocked by officer to allow bank/document updates.',
      });
      toast.success(t('admin.unlockSuccess', 'Farmer profile unlocked. Farmer can now edit and resubmit their details.'));
      setUnlockModalOpen(false);
      setUnlockReason('');
    } catch {
      toast.error('Error unlocking farmer profile.');
    }
  };

  const handleDeclineUnlock = async () => {
    try {
      await rejectUnlockMutation.mutateAsync({
        sellerId: Number(sellerId),
        reason: declineReason || 'Change request declined by administrative officer.',
      });
      toast.info(t('admin.declineSuccess', 'Farmer change request declined.'));
      setDeclineModalOpen(false);
      setDeclineReason('');
    } catch {
      toast.error('Error declining change request.');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 350 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box maxWidth="lg" sx={{ mx: 'auto', p: 3 }}>
        <Button startIcon={<MdArrowBack />} onClick={() => navigate('/admin/kyc')} sx={{ mb: 2 }}>
          {t('admin.backToQueue', 'Back to KYC Queue')}
        </Button>
        <Alert severity="error">
          {t('admin.kycProfileNotFound', 'Farmer profile not found or could not be loaded.')}
        </Alert>
      </Box>
    );
  }

  const isVerified = profile.kyc_status === 'verified';
  const isRejected = profile.kyc_status === 'rejected';
  const isPending = profile.kyc_status === 'pending';

  return (
    <Box maxWidth="lg" sx={{ mx: 'auto', pb: 6 }}>
      <PageHeader
        title={`Farmer KYC: ${profile.full_name}`}
        subtitle={`${profile.farm_name ? `${profile.farm_name} • ` : ''}${profile.village}, ${profile.district}, ${profile.state} (User ID #${profile.user_id})`}
        onBack={() => navigate('/admin/kyc')}
        backLabel={t('admin.backToQueue', 'Back to KYC Queue')}
        actions={
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {!isVerified && (
              <Button
                variant="contained"
                color="success"
                startIcon={<MdCheckCircle />}
                onClick={handleApprove}
                sx={{ fontWeight: 700, px: 2.5 }}
              >
                {t('admin.approveKycBtn', 'Approve & Issue Verified Badge')}
              </Button>
            )}
            {isVerified && (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<MdLockOpen />}
                  onClick={() => setUnlockModalOpen(true)}
                  sx={{ fontWeight: 700, px: 2.5 }}
                >
                  {t('admin.unlockFarmerBtn', 'Unlock Profile for Updates')}
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<MdCancel />}
                  onClick={() => setRejectModalOpen(true)}
                  sx={{ fontWeight: 700, px: 2.5 }}
                >
                  Revoke KYC (Reason Required)
                </Button>
              </>
            )}
            {!isVerified && !isRejected && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<MdCancel />}
                onClick={() => setRejectModalOpen(true)}
                sx={{ fontWeight: 700, px: 2.5 }}
              >
                {t('admin.rejectKycBtn', 'Reject with Reason')}
              </Button>
            )}
          </Box>
        }
      />

      {/* Profile Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3.5,
          mb: 3.5,
          borderRadius: 3.5,
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h5" fontWeight={800} color="#0F172A">
              {profile.full_name}
            </Typography>
            <StatusBadge status={profile.kyc_status} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {profile.farm_name ? `🌾 ${profile.farm_name} • ` : ''}
            {profile.village}, {profile.district}, {profile.state} - {profile.pincode}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            User ID: #{profile.user_id} • Registered Phone: {profile.user?.phone || 'N/A'} • Email:{' '}
            {profile.user?.email || 'N/A'}
          </Typography>
        </Box>

        <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Typography variant="caption" color="text.secondary" display="block">
            {t('admin.uploadedAt', 'Last Updated')}: {new Date(profile.updated_at || profile.created_at).toLocaleString()}
          </Typography>
        </Box>
      </Paper>

      {/* Active Pending Change / Unlock Request Banner */}
      {profile.kyc_documents?.unlock_request?.status === 'pending' && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3.5,
            borderRadius: 3.5,
            bgcolor: '#FFFBEB',
            border: '2px solid #FCD34D',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: '#FEF3C7', color: '#B45309' }}>
                <MdWarning size={28} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={800} color="#92400E">
                  {t('admin.changeRequestPendingTitle', '🔔 Farmer Requested Profile Details Change')}
                </Typography>
                <Typography variant="body2" color="#B45309">
                  {t('admin.changeRequestSubmittedOn', 'Submitted on')}:{' '}
                  {new Date(profile.kyc_documents.unlock_request.requested_at).toLocaleString()}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="contained"
                color="warning"
                startIcon={<MdLockOpen />}
                onClick={() => {
                  setUnlockReason(profile.kyc_documents?.unlock_request?.reason || '');
                  setUnlockModalOpen(true);
                }}
                sx={{ fontWeight: 700 }}
              >
                {t('admin.approveAndUnlockBtn', 'Approve & Unlock Profile')}
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<MdCancel />}
                onClick={() => setDeclineModalOpen(true)}
                sx={{ fontWeight: 700 }}
              >
                {t('admin.declineChangeRequestBtn', 'Decline Request')}
              </Button>
            </Box>
          </Box>

          <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed #FDE68A' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
              {t('admin.farmerExplanationLabel', 'FARMER EXPLANATION / REASON')}:
            </Typography>
            <Paper elevation={0} sx={{ p: 1.5, mt: 0.5, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #FDE68A' }}>
              <Typography variant="body1" fontWeight={600} color="#0F172A">
                "{profile.kyc_documents.unlock_request.reason}"
              </Typography>
            </Paper>

            {profile.kyc_documents.unlock_request.requested_fields && (
              <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  {t('admin.requestedFieldsLabel', 'REQUESTED CHANGE CATEGORIES')}:
                </Typography>
                {profile.kyc_documents.unlock_request.requested_fields.map((f) => (
                  <Chip
                    key={f}
                    label={f.replace(/_/g, ' ').toUpperCase()}
                    size="small"
                    color="warning"
                    sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Paper>
      )}

      {/* Previously Declined Change Request Notice */}
      {profile.kyc_documents?.unlock_request?.status === 'rejected' && (
        <Alert severity="info" sx={{ mb: 3.5, borderRadius: 3, fontWeight: 500 }}>
          <strong>{t('admin.changeRequestDeclinedNotice', 'Previous change request was declined')}:</strong>{' '}
          {profile.kyc_documents.unlock_request.rejection_reason || 'Declined by administrative officer.'}
        </Alert>
      )}

      {/* Previous Rejection Banner (if any) */}
      {isRejected && profile.kyc_rejection_reason && (
        <Alert severity="error" sx={{ mb: 3.5, borderRadius: 3, fontWeight: 500 }}>
          <strong>{t('farmer.kycRejectionReasonLabel', 'Rejection Reason')}:</strong> {profile.kyc_rejection_reason}
        </Alert>
      )}

      {/* Grid: Farmer Profile & Bank Details */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Farm & Land Info */}
        <Grid item xs={12} md={6} size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <MdLandscape size={22} color="#16A34A" />
              <Typography variant="subtitle1" fontWeight={700}>
                {t('admin.farmLocationDetails', 'Farm Location & Land Records')}
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('farmer.farmName', 'Farm / Krishi Kendra')}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {profile.farm_name || 'Individual Krishi'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('farmer.landSizeAcres', 'Land Size')}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {profile.land_size_acres ? `${profile.land_size_acres} Acres` : 'Not specified'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('common.village', 'Village')}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {profile.village || '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('common.city', 'Sub-District / Taluka')}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {profile.sub_district || '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('common.district', 'District')}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {profile.district || '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('common.state', 'State & Pincode')}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {profile.state} - {profile.pincode}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Bank Account Info */}
        <Grid item xs={12} md={6} size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <MdAccountBalance size={22} color="#2563EB" />
              <Typography variant="subtitle1" fontWeight={700}>
                {t('admin.bankPayoutDetails', 'Bank Account & Escrow Payout Destination')}
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {/* Automated Name Match & Mismatch Alert */}
            {profile?.name_mismatch && (
              <Alert
                severity="warning"
                icon={<MdWarning size={22} />}
                sx={{
                  mb: 2.5,
                  borderRadius: 2,
                  bgcolor: '#FEF3C7',
                  border: '1px solid #F59E0B',
                  '& .MuiAlert-message': { width: '100%' },
                }}
              >
                <Typography variant="subtitle2" fontWeight={800} color="#92400E">
                  ⚠️ Name Mismatch Warning ({profile.name_match_score || 0}% Match)
                </Typography>
                <Typography variant="body2" color="#B45309" sx={{ mt: 0.5 }}>
                  Farmer Name: <strong>{profile.full_name}</strong> ≠ Bank Holder: <strong>{profile.bank_account_holder || 'N/A'}</strong>
                </Typography>
                <Typography variant="caption" color="#92400E" sx={{ display: 'block', mt: 0.5, fontWeight: 600 }}>
                  Caution: Payouts to mismatched bank accounts can lead to chargebacks or legal disputes. Verify bank passbook proof carefully.
                </Typography>
              </Alert>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('farmer.accountHolderName', 'Account Holder')}
                </Typography>
                <Typography variant="body2" fontWeight={600} color={profile?.name_mismatch ? '#DC2626' : 'inherit'}>
                  {profile.bank_account_holder || profile.full_name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('farmer.bankName', 'Bank Name')}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {profile.bank_name || 'Bank on file'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('farmer.bankAccountNumber', 'Account Number')}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {profile.bank_account_number || profile.masked_account || 'Not provided'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('farmer.ifscCode', 'IFSC Code')}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {profile.bank_ifsc || 'Not provided'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Submitted Documents Inspection Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 0.5 }}>
          {t('admin.documentInspectionTitle', 'Submitted Verification Documents')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t(
            'admin.documentInspectionSubtitle',
            'Examine attached government proofs to ensure identity and genuine agricultural land ownership.'
          )}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Document 1: Aadhaar Card / ID */}
        <Grid item xs={12} md={4} size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3.5,
              border: aadhaarDoc?.file_url ? '2px solid #22C55E' : '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Box sx={{ p: 2, bgcolor: '#F8FAF9', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdBadge size={20} color="#16A34A" />
                <Typography variant="subtitle2" fontWeight={700}>
                  {t('farmer.aadhaarTitle', 'Identity Proof (Aadhaar)')}
                </Typography>
              </Box>
              <Chip
                label={aadhaarDoc?.file_url ? 'ATTACHED' : 'MISSING'}
                size="small"
                color={aadhaarDoc?.file_url ? 'success' : 'default'}
                sx={{ fontSize: '0.68rem', fontWeight: 700 }}
              />
            </Box>

            <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {t('farmer.aadhaarNumber', 'Aadhaar / ID Number')}:
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ mb: 2 }}>
                {aadhaarDoc?.document_number || profile.masked_account || 'Not provided'}
              </Typography>

              {aadhaarDoc?.file_url ? (
                <Box>
                  {aadhaarDoc.file_url.endsWith('.pdf') || aadhaarDoc.mime_type === 'application/pdf' ? (
                    <Box
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        bgcolor: '#F1F5F9',
                        borderRadius: 2,
                        mb: 2,
                        border: '1px dashed #CBD5E1',
                      }}
                    >
                      <MdDescription size={48} color="#DC2626" />
                      <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>
                        {aadhaarDoc.file_name || 'Aadhaar_Document.pdf'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        PDF Document ({aadhaarDoc.file_size ? `${Math.round(aadhaarDoc.file_size / 1024)} KB` : 'Verified'})
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        position: 'relative',
                        borderRadius: 2,
                        overflow: 'hidden',
                        mb: 2,
                        border: '1px solid #E2E8F0',
                        cursor: 'pointer',
                        '&:hover .preview-overlay': { opacity: 1 },
                      }}
                      onClick={() => setPreviewImage(getDocumentUrl(aadhaarDoc.file_url))}
                    >
                      <CardMedia
                        component="img"
                        height="170"
                        image={getDocumentUrl(aadhaarDoc.file_url)}
                        alt="Aadhaar Document"
                        sx={{ objectFit: 'cover' }}
                      />
                      <Box
                        className="preview-overlay"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          bgcolor: 'rgba(15, 23, 42, 0.55)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          color: '#FFFFFF',
                          gap: 1,
                        }}
                      >
                        <MdZoomIn size={24} />
                        <Typography variant="body2" fontWeight={600}>
                          {t('admin.previewDocument', 'Click to Zoom')}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      startIcon={<MdVisibility />}
                      onClick={() =>
                        aadhaarDoc.file_url.endsWith('.pdf')
                          ? window.open(getDocumentUrl(aadhaarDoc.file_url), '_blank')
                          : setPreviewImage(getDocumentUrl(aadhaarDoc.file_url))
                      }
                    >
                      {t('admin.previewDocument', 'View')}
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<MdOpenInNew />}
                      onClick={() => window.open(getDocumentUrl(aadhaarDoc.file_url), '_blank')}
                    >
                      {t('admin.openFullDocument', 'New Tab')}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#F8FAF9', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.noDocsAvailable', 'No Aadhaar document uploaded.')}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Document 2: Gujarat 7/12 & 8A Land Record */}
        <Grid item xs={12} md={4} size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3.5,
              border: landDoc?.file_url ? '2px solid #22C55E' : '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Box sx={{ p: 2, bgcolor: '#F8FAF9', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdLandscape size={20} color="#16A34A" />
                <Typography variant="subtitle2" fontWeight={700}>
                  {t('farmer.landRecordTitle', '7/12 & 8A Land Record')}
                </Typography>
              </Box>
              <Chip
                label={landDoc?.file_url ? 'ATTACHED' : 'MISSING'}
                size="small"
                color={landDoc?.file_url ? 'success' : 'default'}
                sx={{ fontSize: '0.68rem', fontWeight: 700 }}
              />
            </Box>

            <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {t('farmer.surveyNumber', 'Survey / Khata Number')}:
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ mb: 2 }}>
                {landDoc?.survey_number || 'Not provided'}
              </Typography>

              {landDoc?.file_url ? (
                <Box>
                  {landDoc.file_url.endsWith('.pdf') || landDoc.mime_type === 'application/pdf' ? (
                    <Box
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        bgcolor: '#F1F5F9',
                        borderRadius: 2,
                        mb: 2,
                        border: '1px dashed #CBD5E1',
                      }}
                    >
                      <MdDescription size={48} color="#DC2626" />
                      <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>
                        {landDoc.file_name || 'Satbara_7_12.pdf'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        PDF Document ({landDoc.file_size ? `${Math.round(landDoc.file_size / 1024)} KB` : 'Verified'})
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        position: 'relative',
                        borderRadius: 2,
                        overflow: 'hidden',
                        mb: 2,
                        border: '1px solid #E2E8F0',
                        cursor: 'pointer',
                        '&:hover .preview-overlay': { opacity: 1 },
                      }}
                      onClick={() => setPreviewImage(getDocumentUrl(landDoc.file_url))}
                    >
                      <CardMedia
                        component="img"
                        height="170"
                        image={getDocumentUrl(landDoc.file_url)}
                        alt="7/12 Land Record"
                        sx={{ objectFit: 'cover' }}
                      />
                      <Box
                        className="preview-overlay"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          bgcolor: 'rgba(15, 23, 42, 0.55)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          color: '#FFFFFF',
                          gap: 1,
                        }}
                      >
                        <MdZoomIn size={24} />
                        <Typography variant="body2" fontWeight={600}>
                          {t('admin.previewDocument', 'Click to Zoom')}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      startIcon={<MdVisibility />}
                      onClick={() =>
                        landDoc.file_url.endsWith('.pdf')
                          ? window.open(getDocumentUrl(landDoc.file_url), '_blank')
                          : setPreviewImage(getDocumentUrl(landDoc.file_url))
                      }
                    >
                      {t('admin.previewDocument', 'View')}
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<MdOpenInNew />}
                      onClick={() => window.open(getDocumentUrl(landDoc.file_url), '_blank')}
                    >
                      {t('admin.openFullDocument', 'New Tab')}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#F8FAF9', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.noDocsAvailable', 'No 7/12 Land Record uploaded.')}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Document 3: Bank Account Proof */}
        <Grid item xs={12} md={4} size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3.5,
              border: bankDoc?.file_url ? '2px solid #22C55E' : '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Box sx={{ p: 2, bgcolor: '#F8FAF9', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdAccountBalance size={20} color="#2563EB" />
                <Typography variant="subtitle2" fontWeight={700}>
                  {t('farmer.bankProofTitle', 'Bank Account Proof')}
                </Typography>
              </Box>
              <Chip
                label={bankDoc?.file_url ? 'ATTACHED' : 'MISSING'}
                size="small"
                color={bankDoc?.file_url ? 'success' : 'default'}
                sx={{ fontSize: '0.68rem', fontWeight: 700 }}
              />
            </Box>

            <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {t('farmer.bankProofSubtitle', 'Document Type')}:
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ mb: 2 }}>
                {bankDoc?.document_type || 'Cancelled Cheque / Passbook'}
              </Typography>

              {bankDoc?.file_url ? (
                <Box>
                  {bankDoc.file_url.endsWith('.pdf') || bankDoc.mime_type === 'application/pdf' ? (
                    <Box
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        bgcolor: '#F1F5F9',
                        borderRadius: 2,
                        mb: 2,
                        border: '1px dashed #CBD5E1',
                      }}
                    >
                      <MdDescription size={48} color="#DC2626" />
                      <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>
                        {bankDoc.file_name || 'Bank_Passbook.pdf'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        PDF Document ({bankDoc.file_size ? `${Math.round(bankDoc.file_size / 1024)} KB` : 'Verified'})
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        position: 'relative',
                        borderRadius: 2,
                        overflow: 'hidden',
                        mb: 2,
                        border: '1px solid #E2E8F0',
                        cursor: 'pointer',
                        '&:hover .preview-overlay': { opacity: 1 },
                      }}
                      onClick={() => setPreviewImage(getDocumentUrl(bankDoc.file_url))}
                    >
                      <CardMedia
                        component="img"
                        height="170"
                        image={getDocumentUrl(bankDoc.file_url)}
                        alt="Bank Proof"
                        sx={{ objectFit: 'cover' }}
                      />
                      <Box
                        className="preview-overlay"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          bgcolor: 'rgba(15, 23, 42, 0.55)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          color: '#FFFFFF',
                          gap: 1,
                        }}
                      >
                        <MdZoomIn size={24} />
                        <Typography variant="body2" fontWeight={600}>
                          {t('admin.previewDocument', 'Click to Zoom')}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      startIcon={<MdVisibility />}
                      onClick={() =>
                        bankDoc.file_url.endsWith('.pdf')
                          ? window.open(getDocumentUrl(bankDoc.file_url), '_blank')
                          : setPreviewImage(getDocumentUrl(bankDoc.file_url))
                      }
                    >
                      {t('admin.previewDocument', 'View')}
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<MdOpenInNew />}
                      onClick={() => window.open(getDocumentUrl(bankDoc.file_url), '_blank')}
                    >
                      {t('admin.openFullDocument', 'New Tab')}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#F8FAF9', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.noDocsAvailable', 'No bank proof uploaded.')}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Image Zoom Modal */}
      <Dialog
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t('admin.previewDocument', 'High-Resolution Document Preview')}
          </Typography>
          <IconButton onClick={() => setPreviewImage(null)} size="small">
            <MdClose />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 1, bgcolor: '#0F172A', textAlign: 'center' }}>
          {previewImage && (
            <img
              src={previewImage}
              alt="Document Full Preview"
              style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button startIcon={<MdOpenInNew />} onClick={() => window.open(previewImage, '_blank')}>
            {t('admin.openFullDocument', 'Open Full Resolution')}
          </Button>
          <Button onClick={() => setPreviewImage(null)} variant="contained">
            {t('common.close', 'Close')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Modal */}
      <Dialog open={rejectModalOpen} onClose={() => setRejectModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{t('admin.reasonForRejection', 'Reason for KYC Rejection')}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t(
              'admin.rejectionExplanation',
              'Select a preset explanation or write custom feedback. The farmer will be instructed to correct the files.'
            )}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
            {[
              'Aadhaar document photo is blurry or unreadable.',
              '7/12 Land record survey number does not match registered farm.',
              'Bank passbook account name differs from registered farmer name.',
              'Uploaded file is not a valid Gujarat RoR 7/12 & 8A document.',
            ].map((preset) => (
              <Chip
                key={preset}
                label={preset}
                onClick={() => setRejectionReason(preset)}
                clickable
                color={rejectionReason === preset ? 'primary' : 'default'}
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
          </Box>

          <TextField
            label={t('admin.rejectionExplanation', 'Rejection Notes for Farmer')}
            fullWidth
            multiline
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder={t('admin.rejectionPlaceholder', 'e.g. Document image unclear or bank name mismatch.')}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRejectModalOpen(false)}>{t('common.cancel', 'Cancel')}</Button>
          <Button variant="contained" color="error" onClick={handleReject}>
            {t('admin.submitRejection', 'Confirm Rejection')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unlock for Updates Modal */}
      <Dialog open={unlockModalOpen} onClose={() => setUnlockModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {t('admin.unlockFarmerTitle', 'Unlock Profile for Information Updates')}
        </DialogTitle>
        <DialogContent dividers>
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

      {/* Decline Change Request Modal */}
      <Dialog open={declineModalOpen} onClose={() => setDeclineModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {t('admin.declineChangeRequestTitle', 'Decline Farmer Change Request')}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Provide an explanation for declining the farmer's request. The profile will remain verified and locked.
          </Typography>

          <TextField
            label={t('admin.declineReasonLabel', 'Explanation / Reason for Declining')}
            fullWidth
            multiline
            rows={3}
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder={t('admin.declineReasonPlaceholder', 'e.g. Bank details already match official registry.')}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeclineModalOpen(false)}>{t('common.cancel', 'Cancel')}</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeclineUnlock}
            disabled={rejectUnlockMutation.isPending}
            sx={{ fontWeight: 700 }}
          >
            {t('admin.confirmDeclineBtn', 'Confirm & Decline Request')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminKYCDetail;
