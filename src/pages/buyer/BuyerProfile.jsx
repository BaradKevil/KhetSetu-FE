import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Chip,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { MdVerified, MdLanguage, MdBusiness, MdSave } from 'react-icons/md';
import { useGetProfileQuery, useUpdateBuyerProfileMutation } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../../common/custom/LanguageSelector';
import { toast } from 'react-toastify';

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const BuyerProfile = () => {
  const { t } = useLanguage();
  const { data: userProfile, isLoading } = useGetProfileQuery();
  const updateProfileMutation = useUpdateBuyerProfileMutation();

  const profile = userProfile?.buyer_profile || {};

  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [buyerType, setBuyerType] = useState('individual');
  const [gstin, setGstin] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  // Sync state when profile loads
  useEffect(() => {
    if (userProfile) {
      setCompanyName(profile.company_name || '');
      setContactPerson(profile.contact_person || userProfile.full_name || '');
      setBuyerType(profile.buyer_type || 'individual');
      setGstin(profile.gstin || '');
      setPanNumber(profile.pan_number || '');
      setShippingAddress(
        typeof profile.shipping_address === 'string'
          ? profile.shipping_address
          : profile.shipping_address?.address || ''
      );
    }
  }, [userProfile]);

  // GSTIN Live Validation & PAN auto-derivation
  const isGstinFilled = gstin.trim().length > 0;
  const isGstinValid = !isGstinFilled || GSTIN_REGEX.test(gstin.trim().toUpperCase());

  // Check PAN 4th character cross-reference
  const panSegment = gstin.trim().length >= 10 ? gstin.trim().substring(2, 12).toUpperCase() : '';
  const pan4thChar = panSegment.length >= 4 ? panSegment[3] : '';

  let panMismatchWarning = null;
  if (isGstinFilled && isGstinValid && pan4thChar) {
    if (buyerType === 'individual' && pan4thChar !== 'P') {
      panMismatchWarning = t(
        'buyer.panIndividualMismatch',
        "Note: 4th character of PAN segment is '" +
          pan4thChar +
          "'. For an Individual, it is typically 'P'. '" +
          pan4thChar +
          "' denotes a Company or Entity."
      );
    } else if (buyerType !== 'individual' && pan4thChar === 'P') {
      panMismatchWarning = t(
        'buyer.panCompanyMismatch',
        "Note: 4th character of PAN segment is 'P' (Proprietor / Individual). Ensure this matches your registered business type."
      );
    }
  }

  const handleGstinChange = (e) => {
    const val = e.target.value.toUpperCase().trim();
    setGstin(val);
    if (val.length >= 12 && GSTIN_REGEX.test(val)) {
      setPanNumber(val.substring(2, 12));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (isGstinFilled && !isGstinValid) {
      toast.error(t('buyer.invalidGstinToast', 'Please enter a valid 15-character GSTIN.'));
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        company_name: companyName,
        contact_person: contactPerson,
        buyer_type: buyerType,
        gstin: gstin ? gstin.trim().toUpperCase() : null,
        pan_number: panNumber ? panNumber.trim().toUpperCase() : null,
        shipping_address: shippingAddress ? { address: shippingAddress } : null,
      });
      toast.success(t('common.saved', 'Profile updated successfully!'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.SOMETHING_WENT_WRONG', 'Error updating profile'));
    }
  };

  const isVerified = Boolean(profile.is_verified);

  if (isLoading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  return (
    <Box maxWidth="md">
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight={800} color="#0F172A">
          {t('buyer.buyerProfileTitle', '💼 Business & Buyer Profile')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('buyer.businessVerifyDesc', 'Manage your verified trading credentials, GSTIN, and delivery warehouses.')}
        </Typography>
      </Box>

      {/* Verification State Banner (Audit Finding 2) */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {t('common.status', 'Trade Entity Verification')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isVerified
                ? t('buyer.verifiedBenefitsActive', 'Your entity is verified. You can place large-scale orders and post bulk RFQs.')
                : t('buyer.unverifiedLimitNotice', 'You can place retail orders up to ₹25,000. Add your business details and GSTIN to unlock institutional limits.')}
            </Typography>
          </Box>
          <Chip
            icon={isVerified ? <MdVerified /> : undefined}
            label={isVerified ? t('buyer.verifiedBusiness', 'VERIFIED BUSINESS') : t('buyer.unverifiedBuyer', 'BUYER — NOT VERIFIED')}
            color={isVerified ? 'success' : 'default'}
            sx={{
              fontWeight: 800,
              px: 1.5,
              py: 0.5,
              bgcolor: isVerified ? undefined : '#FEF3C7',
              color: isVerified ? undefined : '#92400E',
            }}
          />
        </Box>
      </Paper>

      {/* Preferred Language Setting */}
      <Paper elevation={0} sx={{ p: 3.5, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MdLanguage color="#2E7D32" size={20} />
              {t('common.language', 'Preferred Language')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('common.languagePreferenceDesc', 'System interface language will persist across logins and devices.')}
            </Typography>
          </Box>
          <LanguageSelector variant="select" size="small" />
        </Box>
      </Paper>

      {/* Company / Entity Registration Form (Audit Finding 1 & 8) */}
      <Paper
        component="form"
        onSubmit={handleSave}
        elevation={0}
        sx={{ p: 3.5, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MdBusiness color="#2E7D32" size={22} />
          {t('buyer.companyDetails', 'Trade Entity & Business Details')}
        </Typography>

        <Grid container spacing={2.5}>
          {/* Buyer Type Select */}
          <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label={t('buyer.businessType', 'Buyer Entity Type')}
              fullWidth
              value={buyerType}
              onChange={(e) => setBuyerType(e.target.value)}
            >
              <MenuItem value="individual">{t('buyer.typeIndividual', 'Individual / Retail Buyer')}</MenuItem>
              <MenuItem value="trader">{t('buyer.typeTrader', 'Trader / Commission Agent')}</MenuItem>
              <MenuItem value="miller">{t('buyer.typeMiller', 'Miller / Processor')}</MenuItem>
              <MenuItem value="retailer">{t('buyer.typeRetailer', 'Wholesaler / Retailer')}</MenuItem>
              <MenuItem value="institution">{t('buyer.typeInstitution', 'Institution / Corporate')}</MenuItem>
            </TextField>
          </Grid>

          {/* Company / Farm Business Name */}
          <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
            <TextField
              label={
                buyerType === 'individual'
                  ? t('auth.tradingNameOptional', 'Trade / Display Name (Optional)')
                  : t('auth.companyName', 'Registered Company / Firm Name')
              }
              fullWidth
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={buyerType === 'individual' ? 'e.g. Kevil Farms' : 'e.g. Gujarat Agro Commodities Pvt Ltd'}
            />
          </Grid>

          {/* Authorized Contact Person */}
          <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t('auth.fullName', 'Authorized Contact Person')}
              fullWidth
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="e.g. Ramesh Patel"
            />
          </Grid>

          {/* GSTIN Field with Live Validation */}
          <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t('buyer.gstin', 'GSTIN Number (15 Digits)')}
              fullWidth
              value={gstin}
              onChange={handleGstinChange}
              error={isGstinFilled && !isGstinValid}
              helperText={
                isGstinFilled && !isGstinValid
                  ? t('buyer.gstinFormatError', 'Format: 2 digits state + 10 chars PAN + 1 entity + Z + 1 checksum')
                  : t('buyer.gstinHint', 'Required for business verification and GST input credit')
              }
              placeholder="e.g. 24AAACG1234F1Z5"
            />
          </Grid>

          {/* PAN Number */}
          <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t('buyer.panNumber', 'Entity PAN Number')}
              fullWidth
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
              placeholder="e.g. AAACG1234F"
            />
          </Grid>

          {/* Shipping / Delivery Warehouse Address */}
          <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t('buyer.shippingWarehouse', 'Delivery Warehouse / Shop Address')}
              fullWidth
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="e.g. Plot 12, APMC Market Yard, Rajkot, Gujarat"
            />
          </Grid>

          {/* Mismatch Warning Alert */}
          {panMismatchWarning && (
            <Grid item xs={12} size={12}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                {panMismatchWarning}
              </Alert>
            </Grid>
          )}
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={updateProfileMutation.isPending}
            startIcon={updateProfileMutation.isPending ? <CircularProgress size={18} color="inherit" /> : <MdSave />}
            sx={{ fontWeight: 700, px: 3, py: 1.2, borderRadius: 2 }}
          >
            {updateProfileMutation.isPending ? t('common.saving', 'Saving...') : t('common.save', 'Save Changes')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default BuyerProfile;
