import { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Chip } from '@mui/material';
import { MdVerified } from 'react-icons/md';
import { useGetProfileQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import LocationSelector from '../../common/custom/LocationSelector';
import { toast } from 'react-toastify';

const SellerKYC = () => {
  const { t } = useLanguage();
  const { data: userProfile } = useGetProfileQuery();
  const profile = userProfile?.seller_profile || {};

  const [bankData, setBankData] = useState({
    account_number: '918237465019',
    ifsc: 'SBIN0001248',
    bank_name: 'State Bank of India',
    holder_name: profile.full_name || 'Rameshwar Patel',
  });

  const [farmLocation, setFarmLocation] = useState({
    state: profile.state || 'Gujarat',
    district: profile.district || 'Gir Somnath',
    city: profile.sub_district || 'Kodinar',
    village: profile.village || 'Alidar',
  });

  const handleSaveBank = () => {
    toast.success(t('farmer.bankSavedSuccess', 'Bank details saved for automated direct transfers!'));
  };

  return (
    <Box maxWidth="md">
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight={800} color="#0F172A">
          {t('navigation.farmProfileKyc', '🌾 Farm Profile & KYC Verification')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('farmer.kycRequiredDesc', 'Required for verified farmer badge and automated bank payouts.')}
        </Typography>
      </Box>

      {/* KYC Status Banner */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {t('common.status', 'Verification Status')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('farmer.verifiedBenefits', 'Verified farmers receive priority placement and higher buyer trust.')}
            </Typography>
          </Box>
          <Chip
            icon={<MdVerified />}
            label={t('market.verifiedFarmer', 'VERIFIED FARMER')}
            color="success"
            sx={{ fontWeight: 700, px: 1, py: 0.5 }}
          />
        </Box>
      </Paper>

      {/* Farm Details */}
      <Paper elevation={0} sx={{ p: 3.5, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          {t('farmer.farmDetails', 'Farm & Personal Information')}
        </Typography>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField label={t('auth.fullName', 'Farmer Full Name')} fullWidth defaultValue={profile.full_name || 'Rameshwar Patel'} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label={t('farmer.farmName', 'Farm / Krishi Kendra Name')} fullWidth defaultValue={profile.farm_name || 'Patel Organic Krishi Farm'} />
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

      {/* Bank Account */}
      <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
          {t('farmer.bankAccountTitle', 'Direct Bank Account Details')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          {t('farmer.bankAccountDesc', 'Where escrow payments are credited immediately after delivery confirmations.')}
        </Typography>

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('farmer.accountHolderName', 'Account Holder Name')}
              fullWidth
              value={bankData.holder_name}
              onChange={(e) => setBankData({ ...bankData, holder_name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('farmer.bankAccountNumber', 'Bank Account Number')}
              fullWidth
              value={bankData.account_number}
              onChange={(e) => setBankData({ ...bankData, account_number: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('farmer.ifscCode', 'Bank IFSC Code')}
              fullWidth
              value={bankData.ifsc}
              onChange={(e) => setBankData({ ...bankData, ifsc: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('farmer.bankName', 'Bank Name')}
              fullWidth
              value={bankData.bank_name}
              onChange={(e) => setBankData({ ...bankData, bank_name: e.target.value })}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button variant="contained" color="primary" onClick={handleSaveBank}>
            {t('common.save', 'Update Bank Information')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SellerKYC;
