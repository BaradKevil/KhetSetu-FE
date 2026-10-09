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
  FormHelperText,
  Checkbox,
  FormControlLabel,
  FormGroup,
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
  MdLock,
  MdEditNote,
} from 'react-icons/md';
import {
  useGetSellerProfileQuery,
  useSubmitKYCMutation,
  useUploadDocumentMutation,
  useRequestUnlockMutation,
} from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import LocationSelector from '../../common/custom/LocationSelector';
import { toast } from 'react-toastify';
import PageHeader from '../../common/custom/PageHeader';

const BACKEND_URL =
  (import.meta.env.VITE_BASEURL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const getDocumentUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

// RBI IFSC format regex: 4 letters, 0, 6 alphanumeric
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
// Indian 6-digit Pincode regex
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
// 9 to 18 numeric digits
const ACCOUNT_REGEX = /^\d{9,18}$/;
// 12 numeric digits for Aadhaar
const AADHAAR_REGEX = /^\d{12}$/;

const SellerKYC = () => {
  const { t } = useLanguage();
  const { data: profileData, isLoading, refetch } = useGetSellerProfileQuery();
  const submitKYCMutation = useSubmitKYCMutation();
  const uploadDocMutation = useUploadDocumentMutation();
  const requestUnlockMutation = useRequestUnlockMutation();

  const [form, setForm] = useState({
    full_name: '',
    farm_name: '',
    land_size_acres: '',
    pincode: '',
    bank_account_holder: '',
    bank_account_number: '',
    confirm_bank_account_number: '',
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

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [uploadingDocKey, setUploadingDocKey] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Change Request Modal
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [requestedFields, setRequestedFields] = useState({
    bank_details: true,
    land_records: false,
    farm_name: false,
  });

  // Determine lock state
  const kycStatus = profileData?.kyc_status || 'unverified';
  const isVerified = kycStatus === 'verified';
  const isPending = kycStatus === 'pending';
  const isRejected = kycStatus === 'rejected';
  const isLocked = isVerified || isPending;

  const unlockRequest = profileData?.kyc_documents?.unlock_request || null;
  const isUnlockPending = unlockRequest?.status === 'pending';
  const isUnlockRejected = unlockRequest?.status === 'rejected';

  // Sync state when profile data arrives
  useEffect(() => {
    if (profileData) {
      const accNum = profileData.bank_account_number || '';
      setForm({
        full_name: profileData.full_name || '',
        farm_name: profileData.farm_name || '',
        land_size_acres:
          profileData.land_size_acres !== null && profileData.land_size_acres !== undefined
            ? String(profileData.land_size_acres)
            : '',
        pincode: profileData.pincode || '',
        bank_account_holder: profileData.bank_account_holder || profileData.full_name || '',
        bank_account_number: accNum,
        confirm_bank_account_number: accNum,
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

  const validateField = (name, value) => {
    switch (name) {
      case 'full_name':
        if (!value || value.trim().length < 2) {
          return t('farmer.fullNameRequired', 'Farmer full name is required (min 2 characters).');
        }
        break;
      case 'farm_name':
        if (!value || value.trim().length < 2) {
          return t('farmer.farmNameRequired', 'Farm / Krishi Kendra name is required.');
        }
        break;
      case 'land_size_acres': {
        const acres = Number(value);
        if (!value || isNaN(acres) || acres <= 0) {
          return t('farmer.landSizeRequired', 'Enter a valid positive land size in acres (> 0).');
        }
        break;
      }
      case 'pincode':
        if (!value || !PINCODE_REGEX.test(String(value).trim())) {
          return t('farmer.pincodeInvalid', 'Enter a valid 6-digit postal pincode.');
        }
        break;
      case 'bank_account_holder':
        if (!value || value.trim().length < 2) {
          return t('farmer.holderNameRequired', 'Bank account holder name is required.');
        }
        break;
      case 'bank_name':
        if (!value || value.trim().length < 2) {
          return t('farmer.bankNameRequired', 'Bank name is required.');
        }
        break;
      case 'bank_account_number': {
        const clean = String(value).trim();
        if (!clean || !ACCOUNT_REGEX.test(clean)) {
          return t('farmer.accountNumberInvalid', 'Account number must be between 9 and 18 numeric digits.');
        }
        break;
      }
      case 'confirm_bank_account_number':
        if (value !== form.bank_account_number) {
          return t('farmer.accountMismatch', 'Bank account numbers do not match.');
        }
        break;
      case 'bank_ifsc': {
        const ifsc = String(value).trim().toUpperCase();
        if (!ifsc || !IFSC_REGEX.test(ifsc)) {
          return t('farmer.ifscInvalid', 'Invalid IFSC format. Must be 11 characters (e.g. SBIN0001248).');
        }
        break;
      }
      case 'aadhaar_number': {
        const clean = String(value).replace(/[\s-]/g, '');
        if (!clean || !AADHAAR_REGEX.test(clean)) {
          return t('farmer.aadhaarInvalid', 'Aadhaar number must be exactly 12 numeric digits.');
        }
        break;
      }
      case 'survey_number':
        if (!value || !value.trim()) {
          return t('farmer.surveyNumberRequired', 'Survey / Khata number is mandatory.');
        }
        break;
      default:
        break;
    }
    return '';
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let val = form[field];
    if (field === 'aadhaar_number') val = documents.aadhaar.document_number;
    if (field === 'survey_number') val = documents.land_record.survey_number;

    const errorMsg = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const validateAll = () => {
    const newErrors = {};

    newErrors.full_name = validateField('full_name', form.full_name);
    newErrors.farm_name = validateField('farm_name', form.farm_name);
    newErrors.land_size_acres = validateField('land_size_acres', form.land_size_acres);
    newErrors.pincode = validateField('pincode', form.pincode);
    newErrors.bank_account_holder = validateField('bank_account_holder', form.bank_account_holder);
    newErrors.bank_name = validateField('bank_name', form.bank_name);
    newErrors.bank_account_number = validateField('bank_account_number', form.bank_account_number);
    newErrors.confirm_bank_account_number = validateField('confirm_bank_account_number', form.confirm_bank_account_number);
    newErrors.bank_ifsc = validateField('bank_ifsc', form.bank_ifsc);

    newErrors.aadhaar_number = validateField('aadhaar_number', documents.aadhaar.document_number);
    newErrors.survey_number = validateField('survey_number', documents.land_record.survey_number);

    // Location mandatory check
    if (!farmLocation.state || !farmLocation.district || !farmLocation.city || !farmLocation.village) {
      newErrors.location = t('farmer.locationRequired', 'State, District, Sub-District/Taluka, and Village are all mandatory.');
    }

    // Mandatory document files check
    if (!documents.aadhaar.file_url) {
      newErrors.aadhaar_file = t('farmer.aadhaarDocRequired', 'Government Identity (Aadhaar Card) document is mandatory.');
    }
    if (!documents.land_record.file_url) {
      newErrors.land_file = t('farmer.landDocRequired', 'Gujarat 7/12 & 8A Land Record document is mandatory.');
    }
    if (!documents.bank_proof.file_url) {
      newErrors.bank_file = t('farmer.bankDocRequired', 'Bank Proof (Cancelled Cheque / Passbook) document is mandatory.');
    }

    // Filter non-empty errors
    const filteredErrors = Object.fromEntries(Object.entries(newErrors).filter(([_, v]) => !!v));
    setErrors(filteredErrors);
    return filteredErrors;
  };

  const handleFileUpload = async (docKey, file) => {
    if (!file || isLocked) return;

    setUploadingDocKey(docKey);
    try {
      let localPreview = '';
      if (file.type.startsWith('image/')) {
        localPreview = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
      }

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

      // Clear document error if present
      if (docKey === 'aadhaar') setErrors((prev) => ({ ...prev, aadhaar_file: '' }));
      if (docKey === 'land_record') setErrors((prev) => ({ ...prev, land_file: '' }));
      if (docKey === 'bank_proof') setErrors((prev) => ({ ...prev, bank_file: '' }));

      toast.success(t('farmer.fileUploadedSuccess', 'Document attached successfully!'));
    } catch {
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
    if (isLocked) return;
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

    if (isLocked) {
      toast.warning(t('farmer.lockedWarning', 'Profile is locked. Please request admin unlock to make changes.'));
      return;
    }

    const validationErrors = validateAll();
    const errorKeys = Object.keys(validationErrors);

    if (errorKeys.length > 0) {
      // Touch all fields to show red borders
      const allTouched = {};
      Object.keys(form).forEach((k) => (allTouched[k] = true));
      allTouched.aadhaar_number = true;
      allTouched.survey_number = true;
      setTouched(allTouched);

      const firstError = validationErrors[errorKeys[0]];
      toast.error(firstError || t('farmer.allFieldsMandatoryAlert', 'Please fill in all mandatory fields correctly.'));
      return;
    }

    try {
      await submitKYCMutation.mutateAsync({
        full_name: form.full_name,
        farm_name: form.farm_name,
        land_size_acres: Number(form.land_size_acres),
        state: farmLocation.state,
        district: farmLocation.district,
        sub_district: farmLocation.city,
        village: farmLocation.village,
        pincode: form.pincode,
        bank_account_holder: form.bank_account_holder,
        bank_account_number: form.bank_account_number,
        bank_ifsc: form.bank_ifsc.toUpperCase(),
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

  const handleRequestUnlockSubmit = async () => {
    if (!requestReason.trim()) {
      toast.warning(t('farmer.reasonRequired', 'Please provide an explanation for the change request.'));
      return;
    }

    const selectedKeys = Object.keys(requestedFields).filter((k) => requestedFields[k]);
    try {
      await requestUnlockMutation.mutateAsync({
        reason: requestReason.trim(),
        requested_fields: selectedKeys,
      });
      toast.success(
        t('farmer.changeRequestSubmitted', 'Change request submitted successfully to administration for review.')
      );
      setRequestModalOpen(false);
      setRequestReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting change request.');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 350 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box maxWidth="lg" sx={{ mx: 'auto', pb: 6 }}>
      {/* Page Header */}
      <PageHeader
        title={t('farmer.kycVerificationHeading', '🌾 Farm Profile & KYC Verification')}
        subtitle={t(
          'farmer.kycVerificationSubheading',
          'Government ID, Land Records (7/12 & 8A), and Bank Details for Verified Seller Status.'
        )}
        showBack={true}
      />

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
              <MdVerified size={34} color="#16A34A" />
            ) : isPending ? (
              <MdPending size={34} color="#D97706" />
            ) : isRejected ? (
              <MdErrorOutline size={34} color="#DC2626" />
            ) : (
              <MdBadge size={34} color="#64748B" />
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
                  ? t('farmer.verifiedBenefits', 'Your farmer account is verified. Priority placement active and instant escrow payouts enabled.')
                  : isPending
                  ? t('farmer.pendingNotice', 'Your KYC documents are locked and under active administrative review. Please await officer approval.')
                  : isRejected
                  ? t('farmer.rejectedNotice', 'Your KYC request was rejected. Please review the reason below, update the required fields, and resubmit.')
                  : t('farmer.unverifiedNotice', 'Submit your verification documents to unlock guaranteed bank payouts and buyer trust.')}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
        </Box>

        {/* Lock Banner / Request Change Action */}
        {isVerified && (
          <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid #BBF7D0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdLock color="#15803D" size={20} />
                <Typography variant="body2" color="#166534" fontWeight={500}>
                  {t(
                    'farmer.lockedNotice',
                    'KYC Verified (Locked) - For financial escrow security, verified bank and identity records cannot be altered directly. If you need to update bank details or land records, submit a change request to administration below.'
                  )}
                </Typography>
              </Box>

              {isUnlockPending ? (
                <Chip
                  icon={<MdPending />}
                  label={t('farmer.changeRequestPendingReviewBtn', '⏳ Change Request Pending Review')}
                  color="warning"
                  sx={{ fontWeight: 700, px: 1, py: 0.5 }}
                />
              ) : (
                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  startIcon={<MdEditNote size={18} />}
                  onClick={() => setRequestModalOpen(true)}
                  sx={{ fontWeight: 700, textTransform: 'none', borderColor: '#16A34A' }}
                >
                  {t('farmer.requestChangeBtn', 'Request Details Change from Admin')}
                </Button>
              )}
            </Box>

            {isUnlockPending && (
              <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                <strong>{t('farmer.changeRequestSubmittedHeader', 'Details Change Request Under Review')}:</strong>{' '}
                {t('farmer.changeRequestSubmittedDesc', 'You requested an update on')}{' '}
                {new Date(unlockRequest.requested_at).toLocaleDateString()}.{' '}
                <strong>{t('farmer.reasonLabel', 'Reason')}:</strong> "{unlockRequest.reason}".{' '}
                {t('farmer.awaitingAdminUnlock', 'Platform administrators have received your request and will unlock your profile.')}
              </Alert>
            )}

            {isUnlockRejected && (
              <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                <strong>{t('farmer.changeRequestDeclinedHeader', 'Previous Change Request Declined')}:</strong>{' '}
                {unlockRequest.rejection_reason || 'Declined by platform officers.'}{' '}
                {t('farmer.canSubmitNewRequest', 'You may submit a new request if needed.')}
              </Alert>
            )}
          </Box>
        )}

        {isPending && (
          <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid #FED7AA', display: 'flex', alignItems: 'center', gap: 1 }}>
            <MdLock color="#B45309" size={20} />
            <Typography variant="body2" color="#92400E" fontWeight={500}>
              {t(
                'farmer.pendingLockedNotice',
                'Verification Under Review (Locked) - Your KYC records have been submitted and are currently locked under review by administrative officers. Edits cannot be made while in review.'
              )}
            </Typography>
          </Box>
        )}

        {isRejected && profileData?.kyc_rejection_reason && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed #FCA5A5' }}>
            <Alert severity="error" sx={{ bgcolor: 'transparent', p: 0 }}>
              <strong>{t('farmer.kycRejectionReasonLabel', 'Reason for Rejection')}: </strong>
              {profileData.kyc_rejection_reason}
            </Alert>
          </Box>
        )}
      </Paper>

      {/* Mandatory Notice Banner */}
      {!isLocked && (
        <Alert severity="info" sx={{ mb: 3.5, borderRadius: 3, fontWeight: 500 }}>
          {t('farmer.allFieldsMandatoryAlert', 'All fields and documents marked with * are mandatory. Please provide accurate details before submitting.')}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section 1: Farm & Personal Details */}
        <Paper elevation={0} sx={{ p: 3.5, mb: 3.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MdLandscape size={22} color="#16A34A" />
              <Typography variant="h6" fontWeight={700}>
                {t('farmer.farmPersonalDetails', 'Farm & Personal Details')}
              </Typography>
            </Box>
            {isLocked && (
              <Chip icon={<MdLock />} label="LOCKED" size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.68rem' }} />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {t('farmer.farmPersonalSubtitle', 'Information used to verify farm locality and produce origin.')}
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
              <TextField
                label={`${t('farmer.farmerFullName', 'Farmer Full Name')} *`}
                fullWidth
                disabled={isLocked}
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                onBlur={() => handleBlur('full_name')}
                error={touched.full_name && !!errors.full_name}
                helperText={touched.full_name && errors.full_name}
                placeholder="e.g. Rameshwar Patel"
              />
            </Grid>
            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
              <TextField
                label={`${t('farmer.farmName', 'Farm / Krishi Kendra Name')} *`}
                fullWidth
                disabled={isLocked}
                value={form.farm_name}
                onChange={(e) => setForm({ ...form, farm_name: e.target.value })}
                onBlur={() => handleBlur('farm_name')}
                error={touched.farm_name && !!errors.farm_name}
                helperText={touched.farm_name && errors.farm_name}
                placeholder="e.g. Patel Organic Krishi Farm"
              />
            </Grid>
            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
              <TextField
                label={`${t('farmer.landSizeAcres', 'Total Farm Land Size (in Acres)')} *`}
                type="number"
                inputProps={{ step: '0.1', min: '0.1' }}
                fullWidth
                disabled={isLocked}
                value={form.land_size_acres}
                onChange={(e) => setForm({ ...form, land_size_acres: e.target.value })}
                onBlur={() => handleBlur('land_size_acres')}
                error={touched.land_size_acres && !!errors.land_size_acres}
                helperText={touched.land_size_acres && errors.land_size_acres}
                placeholder={t('farmer.landSizePlaceholder', 'e.g. 5.5')}
              />
            </Grid>
            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
              <TextField
                label={`${t('auth.pincode', 'Postal Pincode')} *`}
                fullWidth
                disabled={isLocked}
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                onBlur={() => handleBlur('pincode')}
                error={touched.pincode && !!errors.pincode}
                helperText={touched.pincode && errors.pincode}
                placeholder="e.g. 382715 (6 digits)"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              {t('common.farmLocation', 'Farm Village & District')} *
            </Typography>
            <LocationSelector
              values={farmLocation}
              onChange={(loc) => {
                if (!isLocked) {
                  setFarmLocation(loc);
                  if (loc.state && loc.district && loc.city && loc.village) {
                    setErrors((prev) => ({ ...prev, location: '' }));
                  }
                }
              }}
              showVillage={true}
              labels={{
                state: `${t('common.state', 'State')} *`,
                district: `${t('common.district', 'District')} *`,
                city: `${t('common.city', 'City / Taluka')} *`,
                village: `${t('common.village', 'Village')} *`,
              }}
            />
            {errors.location && (
              <FormHelperText error sx={{ mt: 1, fontWeight: 500 }}>
                {errors.location}
              </FormHelperText>
            )}
          </Box>
        </Paper>

        {/* Section 2: Direct Bank Account Details */}
        <Paper elevation={0} sx={{ p: 3.5, mb: 3.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MdAccountBalance size={22} color="#2563EB" />
              <Typography variant="h6" fontWeight={700}>
                {t('farmer.bankAccountTitle', 'Direct Bank Account Details')}
              </Typography>
            </Box>
            {isLocked && (
              <Chip icon={<MdLock />} label="LOCKED" size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.68rem' }} />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {t('farmer.bankAccountDesc', 'Where escrow payments are credited immediately after delivery confirmations.')}
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
              <TextField
                label={`${t('farmer.accountHolderName', 'Account Holder Name')} *`}
                fullWidth
                disabled={isLocked}
                value={form.bank_account_holder}
                onChange={(e) => setForm({ ...form, bank_account_holder: e.target.value })}
                onBlur={() => handleBlur('bank_account_holder')}
                error={touched.bank_account_holder && !!errors.bank_account_holder}
                helperText={touched.bank_account_holder && errors.bank_account_holder}
                placeholder="Must match name on Bank Passbook"
              />
            </Grid>
            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
              <TextField
                label={`${t('farmer.bankName', 'Bank Name')} *`}
                fullWidth
                disabled={isLocked}
                value={form.bank_name}
                onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                onBlur={() => handleBlur('bank_name')}
                error={touched.bank_name && !!errors.bank_name}
                helperText={touched.bank_name && errors.bank_name}
                placeholder="e.g. State Bank of India, Bank of Baroda"
              />
            </Grid>
            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
              <TextField
                label={`${t('farmer.bankAccountNumber', 'Bank Account Number')} *`}
                fullWidth
                disabled={isLocked}
                value={form.bank_account_number}
                onChange={(e) => setForm({ ...form, bank_account_number: e.target.value.replace(/\D/g, '') })}
                onBlur={() => handleBlur('bank_account_number')}
                error={touched.bank_account_number && !!errors.bank_account_number}
                helperText={touched.bank_account_number && errors.bank_account_number}
                placeholder="e.g. 918237465019 (9 to 18 digits)"
              />
            </Grid>
            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
              <TextField
                label={`${t('farmer.confirmAccountNumber', 'Confirm Bank Account Number')} *`}
                fullWidth
                disabled={isLocked}
                value={form.confirm_bank_account_number}
                onChange={(e) => setForm({ ...form, confirm_bank_account_number: e.target.value.replace(/\D/g, '') })}
                onBlur={() => handleBlur('confirm_bank_account_number')}
                error={touched.confirm_bank_account_number && !!errors.confirm_bank_account_number}
                helperText={touched.confirm_bank_account_number && errors.confirm_bank_account_number}
                placeholder="Re-enter bank account number"
              />
            </Grid>
            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
              <TextField
                label={`${t('farmer.ifscCode', 'Bank IFSC Code')} *`}
                fullWidth
                disabled={isLocked}
                value={form.bank_ifsc}
                onChange={(e) => setForm({ ...form, bank_ifsc: e.target.value.toUpperCase().trim() })}
                onBlur={() => handleBlur('bank_ifsc')}
                error={touched.bank_ifsc && !!errors.bank_ifsc}
                helperText={touched.bank_ifsc ? errors.bank_ifsc : '11-character code (e.g. SBIN0001248)'}
                placeholder="e.g. SBIN0001248"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Section 3: Verification Documents Upload */}
        <Paper elevation={0} sx={{ p: 3.5, mb: 3.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {t('farmer.kycDocumentsTitle', 'Verification Documents')} *
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t(
                  'farmer.kycDocumentsSubtitle',
                  'Upload government records to earn the Verified Farmer badge and enable automated escrow payouts.'
                )}
              </Typography>
            </Box>
            {isLocked && (
              <Chip icon={<MdLock />} label="LOCKED" size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.68rem' }} />
            )}
          </Box>

          {/* Doc 1: Aadhaar Card */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 2.5,
              borderRadius: 3,
              border: errors.aadhaar_file
                ? '2px solid #EF4444'
                : documents.aadhaar.file_url
                ? '2px solid #22C55E'
                : '1px solid #E2E8F0',
              bgcolor: '#F8FAF9',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdBadge size={22} color="#16A34A" />
                <Typography variant="subtitle1" fontWeight={700}>
                  {t('farmer.aadhaarTitle', 'Government Identity Proof (Aadhaar / Voter ID)')} *
                </Typography>
              </Box>
              {documents.aadhaar.file_url ? (
                <Chip
                  icon={<MdCheckCircle />}
                  label={t('common.attached', 'ATTACHED')}
                  color="success"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              ) : (
                <Chip label="MANDATORY" color="error" size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.68rem' }} />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('farmer.aadhaarSubtitle', 'Clear photo or PDF of your 12-digit Aadhaar Card (Front/Back).')}
            </Typography>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={`${t('farmer.aadhaarNumber', 'Aadhaar / ID Card Number')} *`}
                  fullWidth
                  size="small"
                  disabled={isLocked}
                  value={documents.aadhaar.document_number}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 12);
                    setDocuments((prev) => ({
                      ...prev,
                      aadhaar: { ...prev.aadhaar, document_number: clean },
                    }));
                  }}
                  onBlur={() => handleBlur('aadhaar_number')}
                  error={touched.aadhaar_number && !!errors.aadhaar_number}
                  helperText={touched.aadhaar_number && errors.aadhaar_number}
                  placeholder={t('farmer.aadhaarPlaceholder', '12 numeric digits')}
                />
              </Grid>

              <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {!isLocked && (
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
                        : t('farmer.uploadFileBtn', 'Upload Document *')}
                      <input
                        type="file"
                        hidden
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileUpload('aadhaar', e.target.files[0])}
                      />
                    </Button>
                  )}

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
                      {!isLocked && (
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveDoc('aadhaar')}
                          title={t('farmer.removeDoc', 'Remove')}
                        >
                          <MdDelete />
                        </IconButton>
                      )}
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>

            {errors.aadhaar_file && (
              <FormHelperText error sx={{ mt: 1, fontWeight: 600 }}>
                {errors.aadhaar_file}
              </FormHelperText>
            )}

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
              border: errors.land_file
                ? '2px solid #EF4444'
                : documents.land_record.file_url
                ? '2px solid #22C55E'
                : '1px solid #E2E8F0',
              bgcolor: '#F8FAF9',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdLandscape size={22} color="#16A34A" />
                <Typography variant="subtitle1" fontWeight={700}>
                  {t('farmer.landRecordTitle', 'Gujarat Land Ownership Record (7/12 & 8A Satbara Utaro)')} *
                </Typography>
              </Box>
              {documents.land_record.file_url ? (
                <Chip
                  icon={<MdCheckCircle />}
                  label={t('common.attached', 'ATTACHED')}
                  color="success"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              ) : (
                <Chip label="MANDATORY" color="error" size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.68rem' }} />
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
                  label={`${t('farmer.surveyNumber', 'Survey / Khata Number')} *`}
                  fullWidth
                  size="small"
                  disabled={isLocked}
                  value={documents.land_record.survey_number}
                  onChange={(e) =>
                    setDocuments((prev) => ({
                      ...prev,
                      land_record: { ...prev.land_record, survey_number: e.target.value },
                    }))
                  }
                  onBlur={() => handleBlur('survey_number')}
                  error={touched.survey_number && !!errors.survey_number}
                  helperText={touched.survey_number && errors.survey_number}
                  placeholder={t('farmer.surveyPlaceholder', 'e.g. 142/A, Khata No. 78')}
                />
              </Grid>

              <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {!isLocked && (
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
                        : t('farmer.uploadFileBtn', 'Upload Document *')}
                      <input
                        type="file"
                        hidden
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileUpload('land_record', e.target.files[0])}
                      />
                    </Button>
                  )}

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
                      {!isLocked && (
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveDoc('land_record')}
                          title={t('farmer.removeDoc', 'Remove')}
                        >
                          <MdDelete />
                        </IconButton>
                      )}
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>

            {errors.land_file && (
              <FormHelperText error sx={{ mt: 1, fontWeight: 600 }}>
                {errors.land_file}
              </FormHelperText>
            )}

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
              border: errors.bank_file
                ? '2px solid #EF4444'
                : documents.bank_proof.file_url
                ? '2px solid #22C55E'
                : '1px solid #E2E8F0',
              bgcolor: '#F8FAF9',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MdAccountBalance size={22} color="#2563EB" />
                <Typography variant="subtitle1" fontWeight={700}>
                  {t('farmer.bankProofTitle', 'Bank Account Verification Proof')} *
                </Typography>
              </Box>
              {documents.bank_proof.file_url ? (
                <Chip
                  icon={<MdCheckCircle />}
                  label={t('common.attached', 'ATTACHED')}
                  color="success"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              ) : (
                <Chip label="MANDATORY" color="error" size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.68rem' }} />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t(
                'farmer.bankProofSubtitle',
                'Cancelled Cheque or First Page of Bank Passbook showing IFSC & Account No.'
              )}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {!isLocked && (
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
                    : t('farmer.uploadFileBtn', 'Upload Document *')}
                  <input
                    type="file"
                    hidden
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileUpload('bank_proof', e.target.files[0])}
                  />
                </Button>
              )}

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
                  {!isLocked && (
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveDoc('bank_proof')}
                      title={t('farmer.removeDoc', 'Remove')}
                    >
                      <MdDelete />
                    </IconButton>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    {documents.bank_proof.file_name || 'Bank_Proof'}
                  </Typography>
                </Box>
              )}
            </Box>

            {errors.bank_file && (
              <FormHelperText error sx={{ mt: 1, fontWeight: 600 }}>
                {errors.bank_file}
              </FormHelperText>
            )}
          </Paper>
        </Paper>

        {/* Submit Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, alignItems: 'center' }}>
          {isLocked ? (
            <Chip
              icon={<MdLock />}
              label={
                isVerified
                  ? t('farmer.kycVerified', 'KYC Verified (Locked)')
                  : t('farmer.pendingLockedNotice', 'Verification In Progress (Locked)')
              }
              color={isVerified ? 'success' : 'warning'}
              sx={{ fontWeight: 700, px: 2, py: 2 }}
            />
          ) : (
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={submitKYCMutation.isPending}
              startIcon={
                submitKYCMutation.isPending ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <MdCheckCircle />
                )
              }
              sx={{ fontWeight: 700, px: 4, py: 1.5, borderRadius: 2.5 }}
            >
              {submitKYCMutation.isPending
                ? t('farmer.submittingKycBtn', 'Submitting Verification Records...')
                : t('farmer.submitKycBtn', 'Submit KYC for Verification')}
            </Button>
          )}
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

      {/* Request Details Change Modal */}
      <Dialog
        open={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {t('farmer.requestChangeModalTitle', 'Request KYC / Bank Details Change')}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t(
              'farmer.requestChangeDesc',
              'Provide a reason for requesting modifications to verified records. Platform administrators will review your request and unlock your profile if approved.'
            )}
          </Typography>

          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Select items you need to update:
          </Typography>
          <FormGroup sx={{ mb: 2.5 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={requestedFields.bank_details}
                  onChange={(e) =>
                    setRequestedFields({ ...requestedFields, bank_details: e.target.checked })
                  }
                />
              }
              label="Bank Account Details (Account Number / IFSC / Bank Name)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={requestedFields.land_records}
                  onChange={(e) =>
                    setRequestedFields({ ...requestedFields, land_records: e.target.checked })
                  }
                />
              }
              label="Land Ownership Records (7/12 & 8A / Acres / Survey Number)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={requestedFields.farm_name}
                  onChange={(e) =>
                    setRequestedFields({ ...requestedFields, farm_name: e.target.checked })
                  }
                />
              }
              label="Farm / Krishi Kendra Name or Address"
            />
          </FormGroup>

          <TextField
            label="Reason for Modification *"
            fullWidth
            multiline
            rows={3}
            value={requestReason}
            onChange={(e) => setRequestReason(e.target.value)}
            placeholder="e.g. Changed my bank account to new ICICI branch, need to update bank details."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRequestModalOpen(false)}>{t('common.cancel', 'Cancel')}</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRequestUnlockSubmit}
            disabled={requestUnlockMutation.isPending}
          >
            {requestUnlockMutation.isPending ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SellerKYC;
