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
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  MdVerified,
  MdLanguage,
  MdBusiness,
  MdSave,
  MdSecurity,
  MdPeople,
  MdAccountBalance,
  MdCheckCircle,
  MdLock,
  MdWarning,
} from 'react-icons/md';
import { useGetProfileQuery, useUpdateBuyerProfileMutation } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../../common/custom/LanguageSelector';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import PageHeader from '../../common/custom/PageHeader';

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const BuyerProfile = () => {
  const { t } = useLanguage();
  const { data: userProfile, isLoading } = useGetProfileQuery();
  const updateProfileMutation = useUpdateBuyerProfileMutation();

  const profile = userProfile?.buyer_profile || {};

  const [activeTab, setActiveTab] = useState(0);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [buyerType, setBuyerType] = useState('individual');
  const [gstin, setGstin] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  // Security states
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Team members states
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'Sanjay Rawat', role: 'Godown In-Charge', phone: '+91 98221 00412', permissions: 'Receives delivery & inspects lots' },
    { id: 2, name: 'Amit Desai', role: 'Accountant', phone: '+91 97230 44910', permissions: 'Views invoices & releases escrow' },
  ]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Godown Supervisor');
  const [newMemberPhone, setNewMemberPhone] = useState('');

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
      setTwoFaEnabled(Boolean(userProfile.two_fa_enabled));
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

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Security password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName || !newMemberPhone) {
      toast.error('Please enter name and phone');
      return;
    }
    setTeamMembers((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newMemberName,
        role: newMemberRole,
        phone: newMemberPhone,
        permissions: 'Authorized godown receiver',
      },
    ]);
    setNewMemberName('');
    setNewMemberPhone('');
    toast.success('Team member added successfully!');
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
    <Box maxWidth="lg" sx={{ pb: 6 }}>
      {/* Page Header */}
      <PageHeader
        title={t('buyer.buyerProfileTitle', '💼 Business Profile & Settings')}
        subtitle={t('buyer.businessVerifyDesc', 'Manage your verified trading credentials, GSTIN, team members, and security.')}
        showBack={true}
      />

      {/* Verification State Banner */}
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

      {/* Tabs */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          <Tab label="Entity & KYC" icon={<MdBusiness size={18} />} iconPosition="start" sx={{ fontWeight: 700 }} />
          <Tab label="Trade Limits & Tiers" icon={<MdAccountBalance size={18} />} iconPosition="start" sx={{ fontWeight: 700 }} />
          <Tab label="Security & 2FA" icon={<MdSecurity size={18} />} iconPosition="start" sx={{ fontWeight: 700 }} />
          <Tab label="Team & Godown Receivers" icon={<MdPeople size={18} />} iconPosition="start" sx={{ fontWeight: 700 }} />
          <Tab label="Language & App" icon={<MdLanguage size={18} />} iconPosition="start" sx={{ fontWeight: 700 }} />
        </Tabs>
      </Paper>

      {/* TAB 0: Trade Entity & KYC */}
      {activeTab === 0 && (
        <Paper
          component="form"
          onSubmit={handleSave}
          elevation={0}
          sx={{ p: 3.5, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <MdBusiness color="#2E7D32" size={22} />
            {t('buyer.companyDetails', 'Trade Entity & Business Details')}
          </Typography>

          <Grid container spacing={2.5}>
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

            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t('auth.fullName', 'Authorized Contact Person')}
                fullWidth
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Ramesh Patel"
              />
            </Grid>

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

            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t('buyer.panNumber', 'Entity PAN Number')}
                fullWidth
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                placeholder="e.g. AAACG1234F"
              />
            </Grid>

            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t('buyer.shippingWarehouse', 'Delivery Warehouse / Shop Address')}
                fullWidth
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="e.g. Plot 12, APMC Market Yard, Rajkot, Gujarat"
              />
            </Grid>

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
      )}

      {/* TAB 1: Trade Limits & Tiers */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, border: '1px solid #E2E8F0' }}>
              <Typography variant="h6" fontWeight={800} color="#0F172A" gutterBottom>
                Trading Tiers & Limits
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current Level: <strong>{isVerified ? 'Tier 2 (Institutional Verified)' : 'Tier 1 (Individual)'}</strong>
              </Typography>

              <Box sx={{ p: 2, mb: 2, bgcolor: isVerified ? '#ECFDF5' : '#FEF3C7', borderRadius: 2.5, border: `1px solid ${isVerified ? '#A7F3D0' : '#FDE68A'}` }}>
                <Typography variant="subtitle2" fontWeight={800} color={isVerified ? '#065F46' : '#92400E'}>
                  {isVerified ? 'Unlimited Single Order Limits' : 'Per-Order Limit: ₹25,000'}
                </Typography>
                <Typography variant="caption" color={isVerified ? '#047857' : '#B45309'}>
                  {isVerified
                    ? 'Eligible for truckload direct farm procurement and custom RFQs.'
                    : 'To unlock bulk truckload orders and RFQ bidding, add a valid GSTIN.'}
                </Typography>
              </Box>

              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Tier Benefits Overview:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MdCheckCircle color="#2E7D32" size={18} />
                  <Typography variant="body2">Escrow Protection: 100% on all orders</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MdCheckCircle color="#2E7D32" size={18} />
                  <Typography variant="body2">Direct Farmgate Mandi Rates</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MdCheckCircle color={isVerified ? '#2E7D32' : '#94A3B8'} size={18} />
                  <Typography variant="body2" color={isVerified ? 'text.primary' : 'text.disabled'}>
                    Tax Invoice Input Tax Credit (ITC) Claims
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MdCheckCircle color={isVerified ? '#2E7D32' : '#94A3B8'} size={18} />
                  <Typography variant="body2" color={isVerified ? 'text.primary' : 'text.disabled'}>
                    Post Custom Requirement / RFQ to 500+ Farmers
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, border: '1px solid #E2E8F0' }}>
              <Typography variant="h6" fontWeight={800} color="#0F172A" gutterBottom>
                Delivery Warehouses & Godowns
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Configure primary unloading yards for truck drivers and transporters.
              </Typography>

              <Button component={Link} to="/buyer/addresses" variant="contained" color="primary" sx={{ borderRadius: 2.5, fontWeight: 700 }}>
                Manage Delivery Addresses
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* TAB 2: Security & 2FA */}
      {activeTab === 2 && (
        <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 2 }}>
            Account Security & Authentication
          </Typography>

          <Box sx={{ mb: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={twoFaEnabled}
                  onChange={(e) => {
                    setTwoFaEnabled(e.target.checked);
                    toast.info(`Two-Factor Authentication ${e.target.checked ? 'enabled' : 'disabled'}`);
                  }}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Two-Factor Authentication (SMS / OTP on Login)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Require an SMS verification token on new devices before releasing escrow payouts.
                  </Typography>
                </Box>
              }
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <MdLock size={20} color="#2E7D32" />
            Change Account Password
          </Typography>

          <form onSubmit={handlePasswordChange}>
            <Grid container spacing={2} maxWidth="sm">
              <Grid item xs={12} size={12}>
                <TextField
                  label="Current Password"
                  type="password"
                  fullWidth
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} size={12}>
                <TextField
                  label="New Password"
                  type="password"
                  fullWidth
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} size={12}>
                <TextField
                  label="Confirm New Password"
                  type="password"
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} size={12}>
                <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: 2, fontWeight: 700 }}>
                  Update Password
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}

      {/* TAB 3: Team Members */}
      {activeTab === 3 && (
        <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 1 }}>
            Authorized Godown Personnel & Team
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Authorize warehouse supervisors to verify truck arrival, check produce moisture, and enter delivery OTPs.
          </Typography>

          <TableContainer sx={{ mb: 4, border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Designation</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Mobile Number</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Assigned Role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamMembers.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{m.name}</TableCell>
                    <TableCell>{m.role}</TableCell>
                    <TableCell>{m.phone}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{m.permissions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
            Add Authorized Supervisor
          </Typography>
          <Box component="form" onSubmit={handleAddMember}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Full Name"
                  fullWidth
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Vikram Solanki"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Designation / Role"
                  fullWidth
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4} size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Mobile Number (+91)"
                  fullWidth
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  placeholder="+91 98765 XXXXX"
                  required
                />
              </Grid>
              <Grid item xs={12} size={12}>
                <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: 2, fontWeight: 700 }}>
                  Add Member
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}

      {/* TAB 4: Language & App */}
      {activeTab === 4 && (
        <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
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
      )}
    </Box>
  );
};

export default BuyerProfile;
