import { Box, Typography, Paper, Grid, TextField, Button, Chip } from '@mui/material';
import { MdVerified, MdBusinessCenter } from 'react-icons/md';
import { useGetProfileQuery } from '../../Api/Api';
import { toast } from 'react-toastify';

const BuyerProfile = () => {
  const { data: userProfile } = useGetProfileQuery();
  const profile = userProfile?.buyer_profile || {};

  return (
    <Box maxWidth="md">
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight={800} color="#0F172A">
          💼 Business & Buyer Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your verified trading credentials, GSTIN, and delivery warehouses.
        </Typography>
      </Box>

      {/* Verification Badge */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Trade Entity Verification
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Verified businesses can post large quantity bulk purchase RFQs.
            </Typography>
          </Box>
          <Chip
            icon={<MdVerified />}
            label="VERIFIED BUYER"
            color="primary"
            sx={{ fontWeight: 700, px: 1, py: 0.5 }}
          />
        </Box>
      </Paper>

      {/* Company Info */}
      <Paper elevation={0} sx={{ p: 3.5, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Company Registration Details
        </Typography>

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField label="Company Name" fullWidth defaultValue={profile.company_name || 'Gujarat Agro Commodities Pvt Ltd'} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Authorized Contact Person" fullWidth defaultValue={profile.contact_person || 'Jayesh Shah'} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Buyer Type" fullWidth defaultValue={profile.buyer_type?.toUpperCase() || 'TRADER'} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="GSTIN Number" fullWidth defaultValue={profile.gstin || '24AAACG1234F1Z5'} />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button variant="contained" color="primary" onClick={() => toast.success('Profile updated!')}>
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default BuyerProfile;
