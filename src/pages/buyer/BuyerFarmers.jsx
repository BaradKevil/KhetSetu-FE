import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Chip,
  Paper,
  InputAdornment,
  Avatar,
  IconButton,
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  MdSearch,
  MdLocationOn,
  MdVerified,
  MdAgriculture,
  MdStar,
  MdStorefront,
  MdClear,
  MdArrowForward,
} from 'react-icons/md';
import { useGetVerifiedFarmersQuery, useGetMarketStatsQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import PageHeader from '../../common/custom/PageHeader';
import KPICard from '../../common/custom/KPICard';

const BuyerFarmers = () => {
  const { t, formatCurrency } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(true);

  const { data: marketStats } = useGetMarketStatsQuery();
  const { data: farmersData, isLoading } = useGetVerifiedFarmersQuery({
    search: search || undefined,
    state: selectedState || undefined,
    verified_only: verifiedOnly ? 'true' : 'false',
  });

  const rawFarmers =
    farmersData?.items ||
    farmersData?.data ||
    farmersData?.rows ||
    (Array.isArray(farmersData) ? farmersData : []);
  const farmers = Array.isArray(rawFarmers) ? rawFarmers : [];

  const handleResetFilters = () => {
    setSearch('');
    setSelectedState('');
    setVerifiedOnly(true);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Page Header */}
      <PageHeader
        title={t('buyer.verifiedFarmersTitle', '🌾 Verified Farmers & Producers Directory')}
        subtitle={t('buyer.verifiedFarmersSubtitle', 'Directly connect with KYC-verified farmers and inspect active farm harvests with 100% escrow protection.')}
      />

      {/* Market Pulse Summary */}
      {marketStats && (
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              label={t('market.verifiedFarmers', 'Verified Farmers')}
              value={marketStats.verifiedFarmers ?? 0}
              subtitle={t('market.verifiedFarmersSub', 'KYC validated')}
              icon={<MdVerified />}
              color="green"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              label={t('market.liveListings', 'Active Listings')}
              value={marketStats.liveListings ?? 0}
              subtitle={t('market.liveListingsSub', 'Live harvest lots')}
              icon={<MdAgriculture />}
              color="blue"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              label={t('market.cropsAvailable', 'Crops Available')}
              value={marketStats.cropsAvailable ?? 0}
              subtitle={t('market.cropsAvailableSub', 'Catalog varieties')}
              icon={<MdStorefront />}
              color="cyan"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              label={t('market.totalVolume', 'Available Volume')}
              value={marketStats.totalQtyTonnes ? `${marketStats.totalQtyTonnes} MT` : 'Available'}
              subtitle={t('market.totalVolumeSub', 'Total tonnage')}
              icon={<MdAgriculture />}
              color="purple"
            />
          </Grid>
        </Grid>
      )}

      {/* Filter Bar */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={5} size={{ xs: 12, sm: 6, md: 5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('buyer.searchFarmerPlaceholder', 'Search by farmer name, farm, village or district...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MdSearch color="#64748B" size={20} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch('')}>
                      <MdClear size={16} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4} size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t('market.stateRegion', 'State / Region')}
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <MenuItem value="">{t('market.allStates', 'All States')}</MenuItem>
              <MenuItem value="Gujarat">Gujarat</MenuItem>
              <MenuItem value="Punjab">Punjab</MenuItem>
              <MenuItem value="Haryana">Haryana</MenuItem>
              <MenuItem value="Madhya Pradesh">Madhya Pradesh</MenuItem>
              <MenuItem value="Rajasthan">Rajasthan</MenuItem>
              <MenuItem value="Maharashtra">Maharashtra</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={3} size={{ xs: 12, md: 3 }} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<MdVerified size={16} />}
              label={t('buyer.verifiedOnly', 'KYC Verified Only')}
              clickable
              color={verifiedOnly ? 'success' : 'default'}
              variant={verifiedOnly ? 'filled' : 'outlined'}
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              sx={{ fontWeight: 700, width: '100%', py: 2.2 }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Farmer Grid */}
      {isLoading ? (
        <Typography textAlign="center" py={8} color="text.secondary">
          {t('buyer.loadingFarmers', 'Loading verified farmers directory...')}
        </Typography>
      ) : farmers.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: '#F8FAF9',
              border: '2px dashed #CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              fontSize: 30,
            }}
          >
            🧑‍🌾
          </Box>
          <Typography variant="h5" fontWeight={800} color="#0F172A" gutterBottom>
            {t('buyer.noFarmersFound', 'No farmers matched criteria')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 460, mx: 'auto', lineHeight: 1.6 }}>
            {t('buyer.noFarmersDesc', 'Try clearing or relaxing your search query to explore more farmers.')}
          </Typography>
          {(search || selectedState || !verifiedOnly) && (
            <Button variant="outlined" color="primary" onClick={handleResetFilters}>
              {t('market.resetFilters', 'Reset Filters')}
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {farmers.map((farmer) => {
            const isVerified = farmer.kyc_status === 'verified';
            const farmerId = farmer.user_id || farmer.id;

            return (
              <Grid item xs={12} sm={6} md={4} size={{ xs: 12, sm: 6, md: 4 }} key={farmer.id}>
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
                  <CardContent sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', width: 48, height: 48, fontWeight: 700 }}>
                          {farmer.full_name ? farmer.full_name[0].toUpperCase() : <MdAgriculture />}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={800} color="#0F172A" noWrap>
                            {farmer.full_name || 'Farmer'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            🌾 {farmer.farm_name || 'Family Farm'}
                          </Typography>
                        </Box>
                      </Box>
                      {isVerified && (
                        <Chip
                          icon={<MdVerified size={14} />}
                          label={t('common.verified', 'Verified')}
                          size="small"
                          color="success"
                          sx={{ fontWeight: 800, fontSize: '0.72rem' }}
                        />
                      )}
                    </Box>

                    {/* Location */}
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                      <MdLocationOn color="#64748B" size={16} />
                      {farmer.village ? `${farmer.village}, ` : ''}{farmer.district}, {farmer.state}
                    </Typography>

                    {/* Trust Metrics */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 1.5, bgcolor: '#F8FAF9', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MdStar color="#F59E0B" size={18} />
                        <Typography variant="body2" fontWeight={800}>
                          {farmer.rating_avg ? Number(farmer.rating_avg).toFixed(1) : '5.0'}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        • {farmer.total_sales_count ?? 0} batches fulfilled
                      </Typography>
                    </Box>

                    {/* Crops Grown */}
                    {farmer.crops_grown && farmer.crops_grown.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ mb: 0.8 }}>
                          {t('buyer.cropsGrown', 'Crops Grown')}:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                          {farmer.crops_grown.map((cropName, idx) => (
                            <Chip key={idx} label={cropName} size="small" variant="outlined" sx={{ fontSize: '0.72rem' }} />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Bottom Action Area */}
                    <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t('buyer.activeProduce', 'Active Produce')}
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={800} color="#2E7D32">
                          {farmer.active_listings_count ?? 0} {t('buyer.listings', 'listings')}
                        </Typography>
                      </Box>
                      <Button
                        component={Link}
                        to={`/buyer/farmers/${farmerId}`}
                        variant="contained"
                        color="primary"
                        size="small"
                        endIcon={<MdArrowForward />}
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                      >
                        {t('buyer.viewFarm', 'View Farm')}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default BuyerFarmers;
