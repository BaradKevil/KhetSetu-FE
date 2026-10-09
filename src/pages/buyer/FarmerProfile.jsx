import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  Paper,
  Avatar,
  Divider,
} from '@mui/material';
import {
  MdLocationOn,
  MdVerified,
  MdAgriculture,
  MdStar,
  MdArrowBack,
  MdSecurity,
  MdCheckCircle,
} from 'react-icons/md';
import { useGetFarmerProfileQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { getFirstImage } from '../../common/imageUtils';
import PageHeader from '../../common/custom/PageHeader';

const FarmerProfile = () => {
  const { id } = useParams();
  const { t, formatCurrency } = useLanguage();
  const { data, isLoading } = useGetFarmerProfileQuery(id);

  if (isLoading) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography color="text.secondary">
          {t('buyer.loadingFarmerProfile', 'Loading farmer credentials and live crops...')}
        </Typography>
      </Box>
    );
  }

  const farmer = data?.farmer;
  const listings = data?.active_listings || [];

  if (!farmer) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3.5 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {t('buyer.farmerNotFound', 'Farmer profile not found')}
        </Typography>
        <Button component={Link} to="/buyer/farmers" startIcon={<MdArrowBack />} sx={{ mt: 2 }} variant="contained">
          {t('buyer.backToFarmers', 'Back to Farmers Directory')}
        </Button>
      </Paper>
    );
  }

  const isVerified = farmer.kyc_status === 'verified';

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Page Header */}
      <PageHeader
        title={farmer.full_name}
        subtitle={`${farmer.farm_name || 'Family Krishi Farm'} • ${farmer.district}, ${farmer.state}`}
        showBack={true}
      />

      {/* Farmer Profile Hero Card */}
      <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8} size={{ xs: 12, md: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Avatar sx={{ bgcolor: '#EFF6FF', color: '#2563EB', width: 72, height: 72, fontSize: 32, fontWeight: 700 }}>
                {farmer.full_name ? farmer.full_name[0].toUpperCase() : <MdAgriculture />}
              </Avatar>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Typography variant="h4" fontWeight={800} color="#0F172A">
                    {farmer.full_name}
                  </Typography>
                  {isVerified && (
                    <Chip
                      icon={<MdVerified size={16} />}
                      label={t('buyer.verifiedFarmerBadge', 'KYC Verified Producer')}
                      color="success"
                      sx={{ fontWeight: 800, fontSize: '0.8rem' }}
                    />
                  )}
                </Box>
                <Typography variant="subtitle1" color="text.secondary" fontWeight={600} sx={{ mt: 0.5 }}>
                  🌾 {farmer.farm_name || 'Family Krishi Farm'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <MdLocationOn color="#64748B" size={18} />
                  {farmer.village ? `${farmer.village}, ` : ''}{farmer.district}, {farmer.state} ({farmer.pincode})
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Quick Stats Column */}
          <Grid item xs={12} md={4} size={{ xs: 12, md: 4 }}>
            <Box sx={{ p: 2, bgcolor: '#F8FAF9', borderRadius: 2.5, border: '1px solid #E2E8F0' }}>
              <Grid container spacing={1.5} textAlign="center">
                <Grid item xs={4} size={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <MdStar color="#F59E0B" size={18} />
                    <Typography variant="h6" fontWeight={800}>
                      {farmer.rating_avg ? Number(farmer.rating_avg).toFixed(1) : '5.0'}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('buyer.rating', 'Rating')}
                  </Typography>
                </Grid>
                <Grid item xs={4} size={4}>
                  <Typography variant="h6" fontWeight={800} color="#0F172A">
                    {farmer.total_sales_count ?? 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('buyer.ordersFulfilled', 'Fulfilled')}
                  </Typography>
                </Grid>
                <Grid item xs={4} size={4}>
                  <Typography variant="h6" fontWeight={800} color="#2E7D32">
                    {farmer.land_size_acres ? `${farmer.land_size_acres} Ac` : 'Verified'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('buyer.farmSize', 'Farm Land')}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>

        {/* KYC Verification Guarantee Banner */}
        <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#2E7D32' }}>
            <MdCheckCircle size={20} />
            <Typography variant="body2" fontWeight={700}>
              {t('buyer.verifiedLandRecords', 'Land Records & Government Identity Verified')}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            • Verified by administrative officers with linked banking escrow payout account.
          </Typography>
        </Box>
      </Paper>

      {/* Live Produce from this Farmer */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight={800} color="#0F172A">
          {t('buyer.liveHarvestFromFarmer', '🌾 Live Harvest Listings from this Farmer')} ({listings.length})
        </Typography>
        <Chip
          icon={<MdSecurity size={16} />}
          label={t('buyer.escrowProtectionActive', '100% Escrow Protected')}
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 700 }}
        />
      </Box>

      {listings.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <Typography variant="h6" fontWeight={700} color="#0F172A">
            {t('buyer.noActiveListingsFarmer', 'No active produce currently listed by this farmer')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t('buyer.checkBackHarvest', 'Check back soon during the next harvest cycle.')}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {listings.map((item) => (
            <Grid item xs={12} sm={6} md={4} size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3.5,
                  border: '1px solid #E2E8F0',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.06)',
                  },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="190"
                    image={getFirstImage(item)}
                    alt={item.variety}
                    sx={{ objectFit: 'cover' }}
                  />
                  <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 0.8 }}>
                    {item.is_organic && (
                      <Chip label={t('market.organicBadge', 'Organic')} size="small" color="success" sx={{ fontWeight: 700 }} />
                    )}
                    {item.grade && (
                      <Chip label={`Grade ${item.grade}`} size="small" sx={{ bgcolor: 'rgba(15,23,42,0.85)', color: '#FFFFFF', fontWeight: 600 }} />
                    )}
                  </Box>
                </Box>

                <CardContent sx={{ flex: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                    {item.crop?.name}
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="#0F172A" gutterBottom noWrap>
                    {item.variety}
                  </Typography>

                  <Box sx={{ p: 1.5, bgcolor: '#F8FAF9', borderRadius: 2, mb: 2, mt: 'auto' }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6} size={6}>
                        <Typography variant="caption" color="text.secondary">
                          {t('market.available', 'Available')}
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {item.available_quantity} {item.unit}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} size={6}>
                        <Typography variant="caption" color="text.secondary">
                          {t('market.minOrder', 'Min Order')}
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {item.min_order_quantity} {item.unit}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #F1F5F9' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {t('market.escrowPrice', 'Escrow Price')}
                      </Typography>
                      <Typography variant="h6" fontWeight={800} color="#2E7D32">
                        {formatCurrency(item.price_per_unit_paise, true)}
                        <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>/{item.unit}</span>
                      </Typography>
                    </Box>
                    <Button
                      component={Link}
                      to={`/buyer/listings/${item.id}`}
                      variant="contained"
                      color="primary"
                      size="small"
                      sx={{ borderRadius: 2, px: 2, fontWeight: 700 }}
                    >
                      {t('market.viewListing', 'Inspect & Buy')}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default FarmerProfile;
