import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  MdVerified,
  MdPending,
  MdErrorOutline,
  MdCloudUpload,
  MdCheckCircle,
  MdDelete,
  MdVisibility,
  MdOpenInNew,
  MdLandscape,
  MdAccountBalance,
  MdBadge,
  MdClose,
  MdDescription,
} from 'react-icons/md';
import {
  useGetSellerProfileQuery,
  useSubmitKYCMutation,
  useUploadDocumentMutation,
} from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import LocationSelector from '../../common/custom/LocationSelector';
import { toast } from 'react-toastify';

const BACKEND_URL =
  (import.meta.env.VITE_BASEURL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const getDocumentUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const SellerKYC = () => {
  const { t } = useLanguage();
  const { data: profileData, isLoading, refetch } = useGetSellerProfileQuery();
  const submitKYCMutation = useSubmitKYCMutation();
  const uploadDocMutation = useUploadDocumentMutation();

  const [form, setForm] = useState({
    full_name: '',
    farm_name: '',
    land_size_acres: '',
    pincode: '',
    bank_account_holder: '',
    bank_account_number: '',
    bank_ifsc: '',
    bank_name: '',
  });

  const [farmLocation, setFarmLocation] = useState({
    state: 'Gujarat',
    district: '',
    city: '',
    village: '',
  });

  const [documents, setDocuments] = useState({
    aadhaar: {
      document_type: 'Aadhaar Card',
      document_number: '',
      file_url: '',
      file_name: '',
      file_size: null,
    },
    land_record: {
      document_type: '7/12 & 8A RoR (Satbara Utaro)',
      survey_number: '',
      file_url: '',
      file_name: '',
      file_size: null,
    },
    bank_proof: {
      document_type: 'Cancelled Cheque / Passbook',
      file_url: '',
      file_name: '',
      file_size: null,
    },
  });

  const [uploadingDocKey, setUploadingDocKey] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Sync state when profile data arrives
  useEffect(() => {
    if (profileData) {
      setForm({
        full_name: profileData.full_name || '',
        farm_name: profileData.farm_name || '',
        land_size_acres: profileData.land_size_acres !== null && profileData.land_size_acres !== undefined ? String(profileData.land_size_acres) : '',
        pincode: profileData.pincode || '',
        bank_account_holder: profileData.bank_account_holder || profileData.full_name || '',
        bank_account_number: profileData.bank_account_number || '',
        bank_ifsc: profileData.bank_ifsc || '',
        bank_name: profileData.bank_name || '',
      });

      setFarmLocation({
        state: profileData.state || 'Gujarat',
        district: profileData.district || '',
        city: profileData.sub_district || '',
        village: profileData.village || '',
      });

      if (profileData.kyc_documents) {
        setDocuments((prev) => ({
          ...prev,
          ...profileData.kyc_documents,
          aadhaar: {
            ...prev.aadhaar,
            ...(profileData.kyc_documents.aadhaar || {}),
          },
          land_record: {
            ...prev.land_record,
            ...(profileData.kyc_documents.land_record || {}),
          },
          bank_proof: {
            ...prev.bank_proof,
            ...(profileData.kyc_documents.bank_proof || {}),
          },
        }));
      }
    }
  }, [profileData]);

  const handleFileUpload = async (docKey, file) => {
    if (!file) return;

    setUploadingDocKey(docKey);
    try {
      // 1. Read locally for instant preview if image
      let localPreview = '';
      if (file.type.startsWith('image/')) {
        localPreview = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
      }

      // 2. Upload to server
      const uploadResult = await uploadDocMutation.mutateAsync(file);

      setDocuments((prev) => ({
        ...prev,
        [docKey]: {
          ...prev[docKey],
          file_url: uploadResult?.file_url || localPreview,
          file_name: uploadResult?.file_name || file.name,
          file_size: uploadResult?.file_size || file.size,
          uploaded_at: new Date().toISOString(),
        },
      }));

      toast.success(t('farmer.fileUploadedSuccess', 'Document uploaded successfully!'));
    } catch {
      // Fallback: Read as base64 data URL directly
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocuments((prev) => ({
          ...prev,
          [docKey]: {
            ...prev[docKey],
            file_url: e.target.result,
            file_name: file.name,
            file_size: file.size,
            uploaded_at: new Date().toISOString(),
          },
        }));
        toast.info('Document attached locally.');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingDocKey(null);
    }
  };

  const handleRemoveDoc = (docKey) => {
    setDocuments((prev) => ({
      ...prev,
      [docKey]: {
        ...prev[docKey],
        file_url: '',
        file_name: '',
        file_size: null,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.full_name.trim()) {
      toast.warning(t('auth.nameRequired', 'Farmer name is required.'));
      return;
    }

    if (!documents.aadhaar.file_url && !documents.land_record.file_url) {
      toast.warning(t('farmer.docsRequiredWarning', 'Please attach at least your ID / Aadhaar and Land Record.'));
      return;
    }

    try {
      await submitKYCMutation.mutateAsync({
        full_name: form.full_name,
        farm_name: form.farm_name,
        land_size_acres: form.land_size_acres ? Number(form.land_size_acres) : null,
        state: farmLocation.state,
        district: farmLocation.district,
        sub_district: farmLocation.city,
        village: farmLocation.village,
        pincode: form.pincode,
        bank_account_holder: form.bank_account_holder,
        bank_account_number: form.bank_account_number,
        bank_ifsc: form.bank_ifsc,
        bank_name: form.bank_name,
        kyc_documents: documents,
      });

      toast.success(
        t(
          'farmer.kycSubmittedToast',
          'KYC verification submitted successfully! Administrative officers will review within 24 hours.'
        )
      );
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.SOMETHING_WENT_WRONG', 'Error submitting KYC.'));
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 350 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const kycStatus = profileData?.kyc_status || 'unverified';
  const isVerified = kycStatus === 'verified';
  const isPending = kycStatus === 'pending';
  const isRejected = kycStatus === 'rejected';

  return (
    <Box maxWidth="md" sx={{ mx: 'auto', pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight={800} color="#0F172A">
          {t('farmer.kycVerificationHeading', '🌾 Farm Profile & KYC Verification')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t(
            'farmer.kycVerificationSubheading',
            'Government ID, Land Records (7/12 & 8A), and Bank Details for Verified Seller Status.'
          )}
        </Typography>
      </Box>

      {/* KYC Status Dynamic Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3.5,
          borderRadius: 3.5,
          border: '1px solid',
          borderColor: isVerified
            ? '#BBF7D0'
            : isPending
            ? '#FED7AA'
            : isRejected
            ? '#FECACA'
            : '#E2E8F0',
          bgcolor: isVerified
            ? '#F0FDF4'
            : isPending
            ? '#FFFBEB'
            : isRejected
            ? '#FEF2F2'
            : '#FFFFFF',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {isVerified ? (
              <MdVerified size={32} color="#16A34A" />
            ) : isPending ? (
              <MdPending size={32} color="#D97706" />
            ) : isRejected ? (
              <MdErrorOutline size={32} color="#DC2626" />
            ) : (
              <MdBadge size={32} color="#64748B" />
            )}
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                {t('farmer.kycStatusLabel', 'Verification Status')}:{' '}
                <span
                  style={{
                    color: isVerified
                      ? '#16A34A'
                      : isPending
                      ? '#D97706'
                      : isRejected
                      ? '#DC2626'
                      : '#475569',
                  }}
                >
                  {isVerified
                    ? t('farmer.kycVerified', 'Verified Farmer')
                    : isPending
                    ? t('farmer.kycPending', 'Under Review')
                    : isRejected
                    ? t('farmer.kycRejected', 'KYC Rejected')
                    : t('farmer.kycUnverified', 'Not Verified')}
                </span>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isVerified
                  ? t('farmer.verifiedBenefits', 'Your farmer account is verified. You receive priority placement and instant escrow releases.')
                  : isPending
                  ? t('farmer.pendingNotice', 'Your documents are being reviewed by the administrative officer. You can update details at any time.')
                  : isRejected
                  ? t('farmer.rejectedNotice', 'Your KYC request was rejected. Please review the reason below and submit updated documents.')
                  : t('farmer.unverifiedNotice', 'Submit your verification documents to unlock guaranteed bank payouts and buyer trust.')}
              </Typography>
            </Box>
          </Box>

          <Chip
            label={
              isVerified
                ? t('farmer.verifiedFarmerBadge', 'VERIFIED FARMER')
                : isPending
                ? t('farmer.pendingFarmerBadge', 'VERIFICATION PENDING')
                : isRejected
                ? t('farmer.rejectedFarmerBadge', 'REJECTED')
                : t('farmer.unverifiedFarmerBadge', 'UNVERIFIED')
            }
            color={isVerified ? 'success' : isPending ? 'warning' : isRejected ? 'error' : 'default'}
            sx={{ fontWeight: 800, px: 1, py: 0.5, fontSize: '0.75rem' }}
          />
        </Box>

        {isRejected && profileData?.kyc_rejection_reason && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed #FCA5A5' }}>
            <Alert severity="error" sx={{ bgcolor: 'transparent', p: 0 }}>
              <strong>{t('farmer.kycRejectionReasonLabel', 'Reason for Rejection')}: </strong>
              {profileData.kyc_rejection_reason}
            </Alert>
          </Box>
        )}
      </Paper>

      <form onSubmit={handleSubmit}>
        {/* Section 1: Farm & Personal Details */}
        <Paper elevation={0} sx={{ p: 3.5, mb: 3.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <MdLandscape size={22} color="#16A34A" />
            <Typography variant="h6" fontWeight={700}>
              {t('farmer.farmPersonalDetails', 'Farm & Personal Details')}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {t('farmer.farmPersonalSubtitle', 'Information used to verify farm locality and produce origin.')}
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t('farmer.farmerFullName', 'Farmer Full Name')}
                fullWidth
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="e.g. Rameshwar Patel"
              />
            </Grid>
            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t('farmer.farmName', 'Farm / Krishi Kendra Name')}
                fullWidth
                value={form.farm_name}
                onChange={(e) => setForm({ ...form, farm_name: e.target.value })}
                placeholder="e.g. Patel Organic Krishi Farm"
              />
            </Grid>
            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t('farmer.landSizeAcres', 'Total Farm Land Size (in Acres)')}
                type="number"
                inputProps={{ step: '0.1', min: '0' }}
                fullWidth
                value={form.land_size_acres}
                onChange={(e) => setForm({ ...form, land_size_acres: e.target.value })}
                placeholder={t('farmer.landSizePlaceholder', 'e.g. 5.5')}
              />
            </Grid>
            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t('auth.pincode', 'Postal Pincode')}
                fullWidth
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                placeholder="e.g. 382715"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2.5 }}>
            <LocationSelector
              values={farmLocation}
              onChange={(loc) => setFarmLocation(loc)}
              showVillage={true}
              labels={{
                state: t('common.state', 'State'),
                district: t('common.district', 'District'),
                city: t('common.city', 'City / Taluka'),
                village: t('common.village', 'Village'),
              }}
            />
          </Box>
        </Paper>

        {/* Section 2: Direct Bank Account Details */}
        <Paper elevation={0} sx={{ p: 3.5, mb: 3.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <MdAccountBalance size={22} color="#2563EB" />
            <Typography variant="h6" fontWeight={700}>
              {t('farmer.bankAccountTitle', 'Direct Bank Account Details')}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {t('farmer.bankAccountDesc', 'Where escrow payments are credited immediately after delivery confirmations.')}
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t('farmer.accountHolderName', 'Account Holder Name')}
                fullWidth
                value={form.bank_account_holder}
                onChange={(e) => setForm({ ...form, bank_account_holder: e.target.value })}
                placeholder="Must match name on Bank Passbook"
              />
            </Grid>
            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t('farmer.bankName', 'Bank Name')}
                fullWidth
                value={form.bank_name}
                onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                placeholder="e.g. State Bank of India, Bank of Baroda"
              />
            </Grid>
            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t('farmer.bankAccountNumber', 'Bank Account Number')}
                fullWidth
                value={form.bank_account_number}
                onChange={(e) => setForm({ ...form, bank_account_number: e.target.value })}
                placeholder="e.g. 918237465019"
              />
            </Grid>
            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t('farmer.ifscCode', 'Bank IFSC Code')}
                fullWidth
                value={form.bank_ifsc}
                onChange={(e) => setForm({ ...form, bank_ifsc: e.target.value.toUpperCase() })}
                placeholder="e.g. SBIN0001248"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Section 3: Verification Documents Upload */}
        <Paper elevation={0} sx={{ p: 3.5, mb: 3.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              {t('farmer.kycDocumentsTitle', 'Verification Documents')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t(
                'farmer.kycDocumentsSubtitle',
                'Upload government records to earn the Verified Farmer badge and enable automated escrow payouts.'
              )}
            </Typography>
          </Box>

          {/* Doc 1: Aadhaar Card */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 2.5,
              borderRadius: 3,
              border: documents.aadhaar.file_url ? '2px solid #22C55E' : '1px solid #E2E8F0',
              bgcolor: '#F8FAF9',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdBadge size={22} color="#16A34A" />
                <Typography variant="subtitle1" fontWeight={700}>
                  {t('farmer.aadhaarTitle', 'Government Identity Proof (Aadhaar / Voter ID)')}
                </Typography>
              </Box>
              {documents.aadhaar.file_url && (
                <Chip
                  icon={<MdCheckCircle />}
                  label={t('common.attached', 'ATTACHED')}
                  color="success"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('farmer.aadhaarSubtitle', 'Clear photo or PDF of your 12-digit Aadhaar Card (Front/Back).')}
            </Typography>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t('farmer.aadhaarNumber', 'Aadhaar / ID Card Number')}
                  fullWidth
                  size="small"
                  value={documents.aadhaar.document_number}
                  onChange={(e) =>
                    setDocuments((prev) => ({
                      ...prev,
                      aadhaar: { ...prev.aadhaar, document_number: e.target.value },
                    }))
                  }
                  placeholder={t('farmer.aadhaarPlaceholder', 'XXXX-XXXX-1234')}
                />
              </Grid>

              <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={
                      uploadingDocKey === 'aadhaar' ? (
                        <CircularProgress size={16} />
                      ) : (
                        <MdCloudUpload />
                      )
                    }
                    disabled={uploadingDocKey === 'aadhaar'}
                    sx={{ fontWeight: 600 }}
                  >
                    {documents.aadhaar.file_url
                      ? t('farmer.replaceFileBtn', 'Replace File')
                      : t('farmer.uploadFileBtn', 'Upload Document')}
                    <input
                      type="file"
                      hidden
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload('aadhaar', e.target.files[0])}
                    />
                  </Button>

                  {documents.aadhaar.file_url && (
                    <>
                      <IconButton
                        color="primary"
                        onClick={() =>
                          documents.aadhaar.file_url.endsWith('.pdf')
                            ? window.open(getDocumentUrl(documents.aadhaar.file_url), '_blank')
                            : setPreviewImage(getDocumentUrl(documents.aadhaar.file_url))
                        }
                        title={t('farmer.viewUploadedDoc', 'Preview Document')}
                      >
                        <MdVisibility />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveDoc('aadhaar')}
                        title={t('farmer.removeDoc', 'Remove')}
                      >
                        <MdDelete />
                      </IconButton>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>

            {documents.aadhaar.file_url && (
              <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdDescription color="#64748B" />
                <Typography variant="caption" color="text.secondary">
                  {documents.aadhaar.file_name || 'Aadhaar_Document'}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Doc 2: Gujarat 7/12 & 8A Land Record */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 2.5,
              borderRadius: 3,
              border: documents.land_record.file_url ? '2px solid #22C55E' : '1px solid #E2E8F0',
              bgcolor: '#F8FAF9',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdLandscape size={22} color="#16A34A" />
                <Typography variant="subtitle1" fontWeight={700}>
                  {t('farmer.landRecordTitle', 'Gujarat Land Ownership Record (7/12 & 8A Satbara Utaro)')}
                </Typography>
              </Box>
              {documents.land_record.file_url && (
                <Chip
                  icon={<MdCheckCircle />}
                  label={t('common.attached', 'ATTACHED')}
                  color="success"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t(
                'farmer.landRecordSubtitle',
                'RoR certificate issued by Gujarat Revenue Department with Khata/Survey No.'
              )}
            </Typography>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t('farmer.surveyNumber', 'Survey / Khata Number')}
                  fullWidth
                  size="small"
                  value={documents.land_record.survey_number}
                  onChange={(e) =>
                    setDocuments((prev) => ({
                      ...prev,
                      land_record: { ...prev.land_record, survey_number: e.target.value },
                    }))
                  }
                  placeholder={t('farmer.surveyPlaceholder', 'e.g. 142/A, Khata No. 78')}
                />
              </Grid>

              <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={
                      uploadingDocKey === 'land_record' ? (
                        <CircularProgress size={16} />
                      ) : (
                        <MdCloudUpload />
                      )
                    }
                    disabled={uploadingDocKey === 'land_record'}
                    sx={{ fontWeight: 600 }}
                  >
                    {documents.land_record.file_url
                      ? t('farmer.replaceFileBtn', 'Replace File')
                      : t('farmer.uploadFileBtn', 'Upload Document')}
                    <input
                      type="file"
                      hidden
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload('land_record', e.target.files[0])}
                    />
                  </Button>

                  {documents.land_record.file_url && (
                    <>
                      <IconButton
                        color="primary"
                        onClick={() =>
                          documents.land_record.file_url.endsWith('.pdf')
                            ? window.open(getDocumentUrl(documents.land_record.file_url), '_blank')
                            : setPreviewImage(getDocumentUrl(documents.land_record.file_url))
                        }
                        title={t('farmer.viewUploadedDoc', 'Preview Document')}
                      >
                        <MdVisibility />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveDoc('land_record')}
                        title={t('farmer.removeDoc', 'Remove')}
                      >
                        <MdDelete />
                      </IconButton>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>

            {documents.land_record.file_url && (
              <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdDescription color="#64748B" />
                <Typography variant="caption" color="text.secondary">
                  {documents.land_record.file_name || 'Satbara_7_12'}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Doc 3: Bank Account Proof */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: documents.bank_proof.file_url ? '2px solid #22C55E' : '1px solid #E2E8F0',
              bgcolor: '#F8FAF9',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdAccountBalance size={22} color="#2563EB" />
                <Typography variant="subtitle1" fontWeight={700}>
                  {t('farmer.bankProofTitle', 'Bank Account Verification Proof')}
                </Typography>
              </Box>
              {documents.bank_proof.file_url && (
                <Chip
                  icon={<MdCheckCircle />}
                  label={t('common.attached', 'ATTACHED')}
                  color="success"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t(
                'farmer.bankProofSubtitle',
                'Cancelled Cheque or First Page of Bank Passbook showing IFSC & Account No.'
              )}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={
                  uploadingDocKey === 'bank_proof' ? (
                    <CircularProgress size={16} />
                  ) : (
                    <MdCloudUpload />
                  )
                }
                disabled={uploadingDocKey === 'bank_proof'}
                sx={{ fontWeight: 600 }}
              >
                {documents.bank_proof.file_url
                  ? t('farmer.replaceFileBtn', 'Replace File')
                  : t('farmer.uploadFileBtn', 'Upload Document')}
                <input
                  type="file"
                  hidden
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload('bank_proof', e.target.files[0])}
                />
              </Button>

              {documents.bank_proof.file_url && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    color="primary"
                    onClick={() =>
                      documents.bank_proof.file_url.endsWith('.pdf')
                        ? window.open(getDocumentUrl(documents.bank_proof.file_url), '_blank')
                        : setPreviewImage(getDocumentUrl(documents.bank_proof.file_url))
                    }
                    title={t('farmer.viewUploadedDoc', 'Preview Document')}
                  >
                    <MdVisibility />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveDoc('bank_proof')}
                    title={t('farmer.removeDoc', 'Remove')}
                  >
                    <MdDelete />
                  </IconButton>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    {documents.bank_proof.file_name || 'Bank_Proof'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Paper>

        {/* Submit Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={submitKYCMutation.isPending}
            startIcon={submitKYCMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <MdCheckCircle />}
            sx={{ fontWeight: 700, px: 4, py: 1.5, borderRadius: 2.5 }}
          >
            {submitKYCMutation.isPending
              ? t('farmer.submittingKycBtn', 'Submitting Verification Records...')
              : t('farmer.submitKycBtn', 'Submit KYC for Verification')}
          </Button>
        </Box>
      </form>

      {/* Image Preview Modal */}
      <Dialog
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t('admin.previewDocument', 'Document Preview')}
          </Typography>
          <IconButton onClick={() => setPreviewImage(null)} size="small">
            <MdClose />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 1, bgcolor: '#0F172A', textAlign: 'center' }}>
          {previewImage && (
            <img
              src={previewImage}
              alt="Document Preview"
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
    </Box>
  );
};

export default SellerKYC;
