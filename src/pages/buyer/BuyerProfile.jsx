import { Box, Typography, Paper, Grid, TextField, Button, Chip } from '@mui/material';
import { MdVerified, MdLanguage } from 'react-icons/md';
import { useGetProfileQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../../common/custom/LanguageSelector';
import { toast } from 'react-toastify';

const BuyerProfile = () => {
  const { t } = useLanguage();
  const { data: userProfile } = useGetProfileQuery();
  const profile = userProfile?.buyer_profile || {};

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

      {/* Verification Badge */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {t('common.status', 'Trade Entity Verification')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('buyer.verifiedBenefits', 'Verified businesses can post large quantity bulk purchase RFQs.')}
            </Typography>
          </Box>
          <Chip
            icon={<MdVerified />}
            label={t('navigation.traderBuyer', 'VERIFIED BUYER')}
            color="primary"
            sx={{ fontWeight: 700, px: 1, py: 0.5 }}
          />
        </Box>
      </Paper>

      {/* Language Preference Setting */}
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

      {/* Company Info */}
      <Paper elevation={0} sx={{ p: 3.5, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          {t('buyer.companyDetails', 'Company Registration Details')}
        </Typography>

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField label={t('auth.companyOptional', 'Company Name')} fullWidth defaultValue={profile.company_name || 'Gujarat Agro Commodities Pvt Ltd'} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label={t('auth.fullName', 'Authorized Contact Person')} fullWidth defaultValue={profile.contact_person || 'Jayesh Shah'} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label={t('buyer.businessType', 'Buyer Type')} fullWidth defaultValue={profile.buyer_type?.toUpperCase() || 'TRADER'} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label={t('buyer.gstin', 'GSTIN Number')} fullWidth defaultValue={profile.gstin || '24AAACG1234F1Z5'} />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button variant="contained" color="primary" onClick={() => toast.success(t('common.saved', 'Profile updated!'))}>
            {t('common.save', 'Save Changes')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default BuyerProfile;
