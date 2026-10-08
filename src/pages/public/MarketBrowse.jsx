import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Chip,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import {
  MdSearch,
  MdLocationOn,
  MdVerified,
  MdSecurity,
  MdFilterList,
  MdClear,
  MdEco,
} from 'react-icons/md';
import { useGetPublicMarketQuery, useGetCropsQuery, useGetMarketStatsQuery } from '../../Api/Api';
import Navbar from '../../common/Navbar';
import { useLanguage } from '../../context/LanguageContext';
import { getFirstImage } from '../../common/imageUtils';

const MarketBrowse = () => {
  const { t, formatCurrency } = useLanguage();
  const [searchCrop, setSearchCrop] = useState('');
  const [selectedCropId, setSelectedCropId] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isOrganicOnly, setIsOrganicOnly] = useState(false);

  const { data: crops } = useGetCropsQuery();
  const { data: marketStats } = useGetMarketStatsQuery();
  const { data: marketData, isLoading } = useGetPublicMarketQuery({
    crop_id: selectedCropId || undefined,
    variety: searchCrop || undefined,
    state: selectedState || undefined,
    grade: selectedGrade || undefined,
    sort: sortBy !== 'newest' ? sortBy : undefined,
    is_organic: isOrganicOnly ? 'true' : undefined,
  });

  const cropsList = Array.isArray(crops) ? crops : [];
  const rawProducts =
    marketData?.items ||
    marketData?.data ||
    marketData?.rows ||
    (Array.isArray(marketData) ? marketData : []);
  const products = Array.isArray(rawProducts) ? rawProducts : [];

  const location = useLocation();
  const isInsidePortal =
    location.pathname.startsWith('/buyer') ||
    location.pathname.startsWith('/seller') ||
    location.pathname.startsWith('/admin');

  const selectedCropName = cropsList.find((c) => String(c.id) === String(selectedCropId))?.name;

  const hasActiveFilters = Boolean(
    searchCrop || selectedCropId || selectedState || selectedGrade || isOrganicOnly || sortBy !== 'newest'
  );

  const handleResetFilters = () => {
    setSearchCrop('');
    setSelectedCropId('');
    setSelectedState('');
    setSelectedGrade('');
    setSortBy('newest');
    setIsOrganicOnly(false);
  };

  const mainContent = (
    <>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color="#0F172A">
          {t('market.exploreLiveMandi', '🌾 Explore Live Crop Mandi')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('market.exploreLiveMandiSubtitle', 'Browse verified harvest listings with direct farmer pricing and escrow buyer protection.')}
        </Typography>
      </Box>

      {/* Market Pulse Metric Strip */}
      {marketStats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3} size={{ xs: 6, sm: 3 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {t('market.verifiedFarmers', 'Verified Farmers')}
              </Typography>
              <Typography variant="h6" fontWeight={800} color="#2E7D32">
                {marketStats.verifiedFarmers ?? 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3} size={{ xs: 6, sm: 3 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {t('market.liveListings', 'Active Listings')}
              </Typography>
              <Typography variant="h6" fontWeight={800} color="#0F172A">
                {marketStats.liveListings ?? products.length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3} size={{ xs: 6, sm: 3 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {t('market.cropsAvailable', 'Crops Available')}
              </Typography>
              <Typography variant="h6" fontWeight={800} color="#0288D1">
                {marketStats.cropsAvailable ?? cropsList.length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3} size={{ xs: 6, sm: 3 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {t('market.totalVolume', 'Available Volume')}
              </Typography>
              <Typography variant="h6" fontWeight={800} color="#7C3AED">
                {marketStats.totalQtyTonnes ? `${marketStats.totalQtyTonnes} MT` : 'Available'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Filter & Sort Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('market.searchVarietyPlaceholder', 'Search variety (e.g. Basmati, Lokwan)...')}
              value={searchCrop}
              onChange={(e) => setSearchCrop(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MdSearch color="#64748B" size={20} />
                  </InputAdornment>
                ),
                endAdornment: searchCrop ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchCrop('')}>
                      <MdClear size={16} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2.5} size={{ xs: 12, sm: 6, md: 2.5 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t('market.filterByCrop', 'Filter by Crop')}
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(e.target.value)}
            >
              <MenuItem value="">{t('market.allCrops', 'All Crops')}</MenuItem>
              {cropsList.map((crop) => (
                <MenuItem key={crop.id} value={crop.id}>
                  {crop.name} ({crop.category})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2} size={{ xs: 12, sm: 6, md: 2 }}>
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

          <Grid item xs={12} sm={6} md={2} size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t('market.grade', 'Quality Grade')}
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              <MenuItem value="">{t('market.allGrades', 'All Grades')}</MenuItem>
              <MenuItem value="A">Grade A</MenuItem>
              <MenuItem value="B">Grade B</MenuItem>
              <MenuItem value="C">Grade C</MenuItem>
              <MenuItem value="FAQ">FAQ Standard</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2.5} size={{ xs: 12, sm: 6, md: 2.5 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t('market.sortBy', 'Sort By')}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="newest">{t('market.sortNewest', 'Newest Listings')}</MenuItem>
              <MenuItem value="price_asc">{t('market.sortPriceLowHigh', 'Price: Low to High')}</MenuItem>
              <MenuItem value="price_desc">{t('market.sortPriceHighLow', 'Price: High to Low')}</MenuItem>
              <MenuItem value="qty_desc">{t('market.sortQtyHighLow', 'Quantity: High to Low')}</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {/* Sub-bar: Organic toggle & Active Filter Chips */}
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<MdEco size={16} />}
              label={t('market.organicOnly', 'Organic Only')}
              clickable
              color={isOrganicOnly ? 'success' : 'default'}
              variant={isOrganicOnly ? 'filled' : 'outlined'}
              onClick={() => setIsOrganicOnly(!isOrganicOnly)}
              sx={{ fontWeight: 600, fontSize: '0.8rem' }}
            />

            {/* Active Filters Strip */}
            {searchCrop && (
              <Chip
                label={`Search: "${searchCrop}"`}
                size="small"
                onDelete={() => setSearchCrop('')}
                sx={{ bgcolor: '#F1F5F9' }}
              />
            )}
            {selectedCropName && (
              <Chip
                label={`Crop: ${selectedCropName}`}
                size="small"
                onDelete={() => setSelectedCropId('')}
                sx={{ bgcolor: '#F1F5F9' }}
              />
            )}
            {selectedState && (
              <Chip
                label={`State: ${selectedState}`}
                size="small"
                onDelete={() => setSelectedState('')}
                sx={{ bgcolor: '#F1F5F9' }}
              />
            )}
            {selectedGrade && (
              <Chip
                label={`Grade: ${selectedGrade}`}
                size="small"
                onDelete={() => setSelectedGrade('')}
                sx={{ bgcolor: '#F1F5F9' }}
              />
            )}
            {sortBy !== 'newest' && (
              <Chip
                label={`Sort: ${sortBy === 'price_asc' ? 'Price ↑' : sortBy === 'price_desc' ? 'Price ↓' : 'Quantity ↓'}`}
                size="small"
                onDelete={() => setSortBy('newest')}
                sx={{ bgcolor: '#F1F5F9' }}
              />
            )}

            {hasActiveFilters && (
              <Button
                size="small"
                color="inherit"
                onClick={handleResetFilters}
                sx={{ textTransform: 'none', color: '#64748B', fontSize: '0.8rem', p: 0.5 }}
              >
                {t('market.clearAllFilters', 'Clear All')}
              </Button>
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {t('market.showingListings', 'Showing {{count}} listing(s)', { count: products.length })}
          </Typography>
        </Box>
      </Paper>

      {/* Product Grid */}
      {isLoading ? (
        <Typography textAlign="center" py={8} color="text.secondary">
          {t('market.loadingListings', 'Loading verified crop listings...')}
        </Typography>
      ) : products.length === 0 ? (
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
              fontSize: 32,
            }}
          >
            🌾
          </Box>
          <Typography variant="h5" fontWeight={800} color="#0F172A" gutterBottom>
            {t('market.noProductFound', 'No products found')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 460, mx: 'auto', lineHeight: 1.6 }}>
            {hasActiveFilters
              ? t('market.noFilteredProduce', 'No products matched your search or filter criteria. Try resetting filters.')
              : t('market.noLiveProduceBuyer', 'Currently there are no active crop listings available in the marketplace.')}
          </Typography>
          {hasActiveFilters && (
            <Button
              variant="outlined"
              color="primary"
              onClick={handleResetFilters}
            >
              {t('market.resetFilters', 'Reset Filters')}
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {products.map((item) => {
            const isFarmerVerified = item.seller?.seller_profile?.kyc_status === 'approved';
            const farmerName = item.seller?.seller_profile?.full_name || item.seller?.seller_profile?.farm_name;

            return (
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
                    <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                      {item.is_organic && (
                        <Chip
                          label={t('market.organicBadge', 'Organic')}
                          size="small"
                          color="success"
                          sx={{ fontWeight: 700, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                        />
                      )}
                      {item.grade && (
                        <Chip
                          label={`Grade ${item.grade}`}
                          size="small"
                          sx={{ bgcolor: 'rgba(15, 23, 42, 0.85)', color: '#FFFFFF', fontWeight: 600, fontSize: '0.72rem' }}
                        />
                      )}
                    </Box>
                    <Box sx={{ position: 'absolute', bottom: 10, right: 10 }}>
                      <Chip
                        icon={<MdSecurity size={14} style={{ color: '#2E7D32' }} />}
                        label={t('market.escrowProtection', '100% Escrow')}
                        size="small"
                        sx={{ bgcolor: '#FFFFFF', color: '#1E293B', fontWeight: 700, fontSize: '0.7rem', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}
                      />
                    </Box>
                  </Box>

                  <CardContent sx={{ flex: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                        {item.crop?.name}
                      </Typography>
                      {isFarmerVerified && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <MdVerified color="#2E7D32" size={15} />
                          <Typography variant="caption" color="success.main" fontWeight={700}>
                            {t('market.verifiedFarmer', 'Verified Farmer')}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Typography variant="h6" fontWeight={800} color="#0F172A" gutterBottom noWrap>
                      {item.variety}
                    </Typography>

                    {farmerName && (
                      <Typography
                        component={Link}
                        to={location.pathname.startsWith('/buyer') ? `/buyer/farmers/${item.seller_id}` : '#'}
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          mb: 0.5,
                          display: 'block',
                          textDecoration: location.pathname.startsWith('/buyer') ? 'underline' : 'none',
                          color: '#475569',
                          fontWeight: 600,
                        }}
                      >
                        🌾 {farmerName}
                      </Typography>
                    )}

                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                      <MdLocationOn color="#64748B" size={16} />
                      {item.pickup_village ? `${item.pickup_village}, ` : ''}{item.pickup_district}, {item.pickup_state}
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
                        to={location.pathname.startsWith('/buyer') ? `/buyer/listings/${item.id}` : `/market/${item.id}`}
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
            );
          })}
        </Grid>
      )}
    </>
  );

  if (isInsidePortal) {
    return <Box sx={{ pb: 4 }}>{mainContent}</Box>;
  }

  return (
    <Box sx={{ bgcolor: '#F8FAF9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 5 }}>
        {mainContent}
      </Container>
    </Box>
  );
};

export default MarketBrowse;
